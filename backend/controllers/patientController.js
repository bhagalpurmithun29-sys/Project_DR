const Patient = require('../models/Patient');
const Scan = require('../models/Scan');

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
