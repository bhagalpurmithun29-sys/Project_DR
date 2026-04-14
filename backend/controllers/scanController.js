const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const Scan = require('../models/Scan');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
            technician: technician || req.user.name,
            imageUrl,
            eyeSide: eyeSide || 'OD',
            scanId: `SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
            clinicalNotes: notes || 'Screening initiated.',
            status: imageFile ? 'Pending' : 'Pending'
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

        // Path to Python bridge - check if venv exists, else use system python
        const venvPath = path.join(__dirname, '../ai/venv/bin/python3');
        const pythonPath = fs.existsSync(venvPath) ? venvPath : 'python3';
        const scriptPath = path.join(__dirname, '../ai/predict.py');
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
                aiResults.error = "AI bridge execution failed.";
            } else {
                try {
                    // Log raw output for debugging
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
            currentScan.lesionPercent = aiResults.lesionPercent || 0;
            currentScan.status = 'Analyzed';
            currentScan.insights = [
                { type: 'info', message: 'Automated AI screening complete.' },
                { 
                    type: aiResults.riskLevel === 'Low Risk' ? 'info' : 'high_risk', 
                    message: `Risk level determined as ${aiResults.riskLevel} (${Math.round(aiResults.probability * 100)}% confidence). Lesion area: ${aiResults.lesionPercent?.toFixed(3)}%.` 
                }
            ];

            await currentScan.save();

            // Update patient risk level if necessary
            try {
                const patient = await Patient.findById(currentScan.patient);
                if (patient) {
                    // Map "High Risk" -> "High", "Moderate" -> "Moderate", etc. for Patient model enum
                    let mappedRisk = aiResults.riskLevel;
                    if (aiResults.riskLevel === 'High Risk') mappedRisk = 'High';
                    if (aiResults.riskLevel === 'Low Risk') mappedRisk = 'Low';
                    
                    if (mappedRisk === 'High' || mappedRisk === 'Moderate') {
                        patient.riskLevel = mappedRisk;
                        await patient.save();
                    }
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
        const scans = await Scan.find().populate('patient', 'name email patientId age gender').sort('-createdAt');
        
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
        const scan = await Scan.findById(req.params.id).populate('patient', 'name email patientId age gender');
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
