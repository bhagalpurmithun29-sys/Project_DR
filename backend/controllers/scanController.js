const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const Scan = require('../models/Scan');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateClinicalSummary } = require('../services/aiService');

// @desc    Create a new scan
// @route   POST /api/scans
// @access  Private/Doctor/Technician
exports.createScan = async (req, res) => {
    try {
        const { patientId, technician, eyeSide, notes } = req.body;
        const imageFile = req.file;

        // Image is required for doctor/technician scans; optional for diagnosis centers
        if (!imageFile && req.user.role !== 'diagnosis_center') {
            return res.status(400).json({ success: false, message: 'Please upload a retinal image' });
        }

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : '/uploads/placeholder.png';

        const scan = await Scan.create({
            patient: patientId,
            diagnosisCenter: req.user.role === 'diagnosis_center' ? req.user._id : undefined,
            technician: technician || req.user.name,
            imageUrl,
            eyeSide: eyeSide || 'OD',
            scanId: `SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
            clinicalNotes: notes || 'Screening initiated.',
            status: 'Pending'
        });

        // Populate patient name for response
        await scan.populate('patient', 'name patientId age');

        res.status(201).json({
            success: true,
            data: scan
        });

        // NOTIFICATION LOGIC: If a diagnosis center uploads, notify all doctors
        if (req.user.role === 'diagnosis_center') {
            try {
                // Find all active doctors
                const doctors = await User.find({ role: 'doctor' });
                
                // Create notifications in parallel
                await Promise.all(doctors.map(dr => 
                    Notification.create({
                        user: dr._id,
                        title: 'New Diagnostic Request',
                        message: `Diagnosis Center ${req.user.name} has submitted a new retinal scan for patient Dr. ${patient.name.split(' ').pop()}. Please review the analysis.`,
                        type: 'Report',
                        relatedId: scan._id
                    })
                ));
            } catch (notifyErr) {
                console.error('Failed to broadcast notifications to doctors:', notifyErr.message);
            }
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Analyze a scan using AI
// @route   POST /api/scans/:id/analyze
// @access  Private/Doctor
exports.analyzeScan = async (req, res) => {
    try {
        const scan = await Scan.findById(req.params.id);
        if (!scan) {
            return res.status(404).json({ success: false, message: 'Scan not found' });
        }

        if (scan.status === 'Analyzed') {
            return res.status(400).json({ success: false, message: 'Scan has already been analyzed.' });
        }

        // Path to Python bridge - use the dedicated venv for stability
        const venvPaths = [
            path.resolve(__dirname, '../ai/venv/bin/python3'),
            path.resolve(__dirname, '../ai/model/bin/python3'),
            path.resolve(__dirname, '../../backend/ai/venv/bin/python3'), // Handle potential nesting
            path.resolve(__dirname, '../../backend/ai/model/bin/python3')
        ];
        
        const venvPath = venvPaths.find(p => fs.existsSync(p));
        const pythonPath = venvPath || 'python3';
        const scriptPath = path.resolve(__dirname, '../ai/predict.py');
        const imagePath = path.join(__dirname, '../', scan.imageUrl);

        // Execute Python Inference
        exec(`${pythonPath} "${scriptPath}" "${imagePath}"`, async (error, stdout, stderr) => {
            let aiResults = {
                riskLevel: 'Moderate', // Fallback
                lesionCount: 0,
                probability: 0
            };

            if (error) {
                console.error(`AI Inference Execution Error: ${error.message}`);
                console.error(`AI Stderr: ${stderr}`);
                // Try to parse stdout even if error, as predict.py might have printed JSON before exiting
                if (stdout) {
                    try {
                        aiResults = JSON.parse(stdout);
                    } catch (e) {
                        aiResults.error = `Execution failed: ${stderr || error.message}`;
                    }
                } else {
                    aiResults.error = `AI bridge execution failed: ${stderr || error.message}`;
                }
            } else {
                try {
                    console.log(`AI Bridge Output: ${stdout}`);
                    aiResults = JSON.parse(stdout);
                } catch (e) {
                    console.error('Failed to parse AI output', stdout);
                    aiResults.error = "Malformed AI result output.";
                }
            }

            // RE-FETCH scan before saving to avoid VersionError if other updates happened during exec
            const currentScan = await Scan.findById(scan._id);
            if (!currentScan) {
                return console.error(`Scan ${scan._id} lost during analysis.`);
            }

            // check for model error reported by predict.py
            if (aiResults.error) {
                currentScan.insights = [{ type: 'error', message: `Analysis Error: ${aiResults.error}` }];
                currentScan.status = 'Pending'; 
                await currentScan.save();
                return res.status(500).json({ success: false, message: aiResults.error });
            }

            currentScan.aiResult = aiResults.riskLevel;
            currentScan.lesionCount = aiResults.lesionCount;
            currentScan.findings = aiResults.findings || [];
            
            // --- NEW: Generate Clinical Summary via Gemini ---
            try {
                const patient = await Patient.findById(currentScan.patient);
                const summary = await generateClinicalSummary({
                    patientName: patient?.name,
                    riskLevel: aiResults.riskLevel,
                    findings: aiResults.findings || [],
                    eyeSide: currentScan.eyeSide
                });
                currentScan.aiReportSummary = summary;
            } catch (geminiErr) {
                console.error('Gemini Summary Failed:', geminiErr);
                currentScan.aiReportSummary = `Diagnostic screening complete. Risk: ${aiResults.riskLevel}. Findings: ${aiResults.findings?.join(', ')}.`;
            }

            currentScan.status = 'Analyzed';
            currentScan.insights = [
                { type: 'info', message: 'Automated AI screening complete.' },
                { 
                    type: aiResults.riskLevel === 'Low Risk' ? 'info' : 'high_risk', 
                    message: `Risk level determined as ${aiResults.riskLevel} (${Math.round((aiResults.probability || 0) * 100)}% confidence). ${aiResults.findings?.length || 0} findings recorded.` 
                }
            ];

            await currentScan.save();

            // Update patient risk level if necessary
            try {
                const patient = await Patient.findById(currentScan.patient);
                if (patient) {
                    // Map "High Risk" -> "High", "Moderate" -> "Moderate", etc. for Patient model enum
                    // Map to Patient model enum: Low, Moderate, High
                    let mappedRisk = 'Low';
                    if (aiResults.riskLevel?.includes('High')) mappedRisk = 'High';
                    else if (aiResults.riskLevel?.includes('Moderate')) mappedRisk = 'Moderate';
                    
                    // Update patient risk regardless of level to stay in sync with latest scan
                    patient.riskLevel = mappedRisk;
                    await patient.save();
                }
            } catch (pError) {
                console.error('Failed to update patient risk level:', pError.message);
            }

            res.status(200).json({
                success: true,
                data: currentScan
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all scans
// @route   GET /api/scans
// @access  Private/Doctor
exports.getScans = async (req, res) => {
    try {
        let query = {};

        // Role-based filtering
        if (req.user.role === 'diagnosis_center') {
            // Centers can see all scans to check previous patient reports
            query = {}; 
        } else if (req.user.role === 'doctor') {
            query = {
                $or: [
                    { technician: req.user.name },
                    { referredDoctor: req.user._id }
                ]
            };
        }

        const scans = await Scan.find(query)
            .populate('patient')
            .populate('diagnosisCenter', 'centerName')
            .populate('referredDoctor', 'name')
            .sort('-createdAt');

        // Self-Healing: Backfill diagnosisCenter ID for legacy records
        if (req.user.role === 'diagnosis_center') {
            const legacyScans = scans.filter(s => !s.diagnosisCenter && s.technician === req.user.name);
            if (legacyScans.length > 0) {
                await Scan.updateMany(
                    { _id: { $in: legacyScans.map(s => s._id) } },
                    { $set: { diagnosisCenter: req.user._id } }
                );
            }
        }

        // LAZY REPAIR: Fix missing demographics in the list view
        for (const scan of scans) {
            if (scan.patient) {
                let updated = false;
                if (!scan.patient.patientId) {
                    scan.patient.patientId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
                    updated = true;
                }
                if (!scan.patient.gender) {
                    scan.patient.gender = 'Male';
                    updated = true;
                }
                if (scan.patient.age === 0 || !scan.patient.age) {
                    scan.patient.age = 45;
                    updated = true;
                }
                if (updated) {
                    await Patient.findByIdAndUpdate(scan.patient._id, {
                        patientId: scan.patient.patientId,
                        gender: scan.patient.gender,
                        age: scan.patient.age
                    });
                }
            }
        }

        res.json({
            success: true,
            count: scans.length,
            data: scans
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single scan
// @route   GET /api/scans/:id
// @access  Private
exports.getScan = async (req, res) => {
    try {
        const scan = await Scan.findById(req.params.id)
            .populate('patient', 'name email patientId age gender')
            .populate('referredDoctor', 'name');
        if (!scan) {
            return res.status(404).json({ success: false, message: 'Scan not found' });
        }

        // LAZY REPAIR: If patient data is missing demographics (legacy records), patch it on-the-fly
        if (scan.patient) {
            let updated = false;
            if (!scan.patient.patientId) {
                scan.patient.patientId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
                updated = true;
            }
            if (!scan.patient.gender) {
                scan.patient.gender = 'Male'; // Default fallback
                updated = true;
            }
            if (scan.patient.age === 0 || !scan.patient.age) {
                scan.patient.age = 45; // Test fallback
                updated = true;
            }

            if (updated) {
                await Patient.findByIdAndUpdate(scan.patient._id, {
                    patientId: scan.patient.patientId,
                    gender: scan.patient.gender,
                    age: scan.patient.age
                });
                console.log(`Lazy Repaired Patient: ${scan.patient.name}`);
            }
        }

        res.json({
            success: true,
            data: scan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Update scan
// @route   PUT /api/scans/:id
// @access  Private/Doctor
exports.updateScan = async (req, res) => {
    try {
        const { status } = req.body;
        
        const scan = await Scan.findById(req.params.id).populate({
            path: 'patient',
            populate: { path: 'user' }
        });

        if (!scan) {
            return res.status(404).json({ success: false, message: 'Scan not found' });
        }

        // Apply updates
        Object.keys(req.body).forEach(key => {
            scan[key] = req.body[key];
        });

        await scan.save();

        // If status moved to Reviewed, create a notification for the patient
        if (status === 'Reviewed' && scan.patient && scan.patient.user) {
            const tempPassword = scan.patient.phoneNumber || 'RetinaAI@2024';
            
            await Notification.create({
                user: scan.patient.user._id,
                title: 'Diagnostic Report Ready',
                message: `Dr. ${req.user.name} has finalized your scan report. You can now view it in the Patient Portal. \n\nAccess Credentials:\nEmail: ${scan.patient.user.email}\nSecurity Hint: Use your registered phone number to login.`,
                type: 'Report',
                relatedId: scan._id
            });
        }

        res.json({
            success: true,
            data: scan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Delete scan
// @route   DELETE /api/scans/:id
// @access  Private/Doctor/Center
exports.deleteScan = async (req, res) => {
    try {
        const scan = await Scan.findById(req.params.id);

        if (!scan) {
            return res.status(404).json({ success: false, message: 'Scan not found' });
        }

        // Authorization placeholder: In a real system, verify the center owns this scan
        // For now, allow doctors and centers to delete

        // 1. Delete image file from storage if it exists and is not the placeholder
        if (scan.imageUrl && !scan.imageUrl.includes('placeholder.png')) {
            const filePath = path.join(__dirname, '../', scan.imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 2. Delete the database record
        await scan.deleteOne();

        res.json({
            success: true,
            message: 'Scan record and associated image deleted.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Manual re-generation of AI clinical summary (Gemini)
 * @route   POST /api/scans/:id/generate-report
 * @access  Private
 */
exports.generateReportSummary = async (req, res) => {
    try {
        const scan = await Scan.findById(req.params.id).populate('patient');
        if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });

        if (scan.status !== 'Analyzed' && scan.status !== 'Reviewed') {
            return res.status(400).json({ success: false, message: 'Scan must be analyzed before generating report summary.' });
        }

        const summary = await generateClinicalSummary({
            patientName: scan.patient?.name,
            riskLevel: scan.aiResult,
            findings: scan.findings || [],
            eyeSide: scan.eyeSide
        });

        scan.aiReportSummary = summary;
        await scan.save();

        res.json({
            success: true,
            message: 'Clinical report summary generated successfully.',
            data: scan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Refer a scan to a doctor
 * @route   POST /api/scans/:id/refer
 * @access  Private/DiagnosisCenter
 */
exports.referScan = async (req, res) => {
    try {
        const { doctorId } = req.body;
        const scan = await Scan.findById(req.params.id);

        if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });

        // Verify the user referring is the diagnosis center of this scan
        if (req.user.role === 'diagnosis_center' && scan.diagnosisCenter?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to refer this scan' });
        }

        // Verify the doctorId exists and is a doctor
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) return res.status(404).json({ success: false, message: 'Target doctor not found' });

        scan.referredDoctor = doctorId;
        scan.referredAt = Date.now();
        await scan.save();

        res.json({
            success: true,
            message: `Report successfully referred to Dr. ${doctor.name}.`,
            data: scan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
