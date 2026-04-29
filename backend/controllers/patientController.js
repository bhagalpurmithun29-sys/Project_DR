const Patient = require('../models/Patient');
const Scan = require('../models/Scan');
const User = require('../models/User');
const generatePatientId = require('../utils/generatePatientId');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Doctor
exports.getPatients = async (req, res) => {
    try {
        let query = {};
        // Note: diagnosis_center used to be isolated, now reverted to global for inter-center report checks
        
        const patients = await Patient.find(query).populate('user', 'name email').sort('-createdAt');
        res.json({
            success: true,
            count: patients.length,
            data: patients,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get patient profile
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('user', 'name email');

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all scans for a patient
// @route   GET /api/patients/:id/scans
// @access  Private
exports.getPatientScans = async (req, res) => {
    try {
        const scans = await Scan.find({ patient: req.params.id }).sort('-date');

        res.json({
            success: true,
            count: scans.length,
            data: scans,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get patient by User ID (for the logged in patient)
// @route   GET /api/patients/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user.id });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private/Doctor
exports.createPatient = async (req, res) => {
    try {
        const { name, email, age, phoneNumber, gender, password } = req.body;

        // Check if patient with this email already exists (if email provided)
        if (email) {
            let existingPatient = await Patient.findOne({ email });
            if (existingPatient) {
                // UPDATE existing patient if fields are missing
                let updated = false;
                if (!existingPatient.patientId) {
                    existingPatient.patientId = await generatePatientId(existingPatient.name);
                    updated = true;
                }
                if (age && (existingPatient.age === 0 || !existingPatient.age)) {
                    existingPatient.age = age;
                    updated = true;
                }
                if (gender && !existingPatient.gender) {
                    existingPatient.gender = gender;
                    updated = true;
                }
                if (phoneNumber && !existingPatient.phoneNumber) {
                    existingPatient.phoneNumber = phoneNumber;
                    updated = true;
                }

                if (updated) await existingPatient.save();

                // Return existing patient to allow multiple scans for the same person
                return res.status(200).json({ success: true, data: existingPatient });
            }
        }

        // Create a temporary user for the patient so they can login later
        // Use provided password or fallback to phoneNumber / default
        const tempPassword = password || phoneNumber || 'RetinaAI@2024';

        // We check if a user with this email already exists but possibly not a patient
        let user;
        if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            user = await User.create({
                name,
                email: email || `${name.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random() * 1000)}@retina-ai.com`,
                password: tempPassword,
                role: 'patient',
                age: age || 0
            });
        }

        const patientId = await generatePatientId(name);

        const patient = await Patient.create({
            user: user._id,
            diagnosisCenter: req.user.role === 'diagnosis_center' ? req.user._id : undefined,
            name,
            patientId,
            age,
            gender,
            email: user.email,
            phoneNumber,
            diabetesType: 'Type 2' // Default
        });

        res.status(201).json({
            success: true,
            data: patient
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload patient photo
// @route   POST /api/patients/:id/photo
// @access  Private
exports.uploadPatientPhoto = async (req, res) => {
    try {
        let patient = await Patient.findById(req.params.id);

        // If patient id in URL is 'me', find by req.user.id
        if (req.params.id === 'me') {
            patient = await Patient.findOne({ user: req.user.id });
        }

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Save the file path to database
        patient.photo = `/${req.file.path}`;
        await patient.save();

        res.status(200).json({
            success: true,
            data: patient.photo
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Update logged-in patient's own profile fields
// @route   PUT /api/patients/me/profile
// @access  Private/Patient
exports.updateMyProfile = async (req, res) => {
    try {
        const { name, age, phone, email } = req.body;
        const patient = await Patient.findOne({ user: req.user.id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        if (name) patient.name = name;
        if (age) patient.age = Number(age);
        if (phone) patient.phoneNumber = phone;
        if (email) patient.email = email;
        await patient.save();
        res.json({ success: true, data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload photo for the logged-in patient
// @route   PUT /api/patients/me/photo
// @access  Private/Patient
exports.updateMyPhoto = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user.id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }
        patient.photo = `/${req.file.path}`;
        await patient.save();
        res.json({ success: true, data: patient.photo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
