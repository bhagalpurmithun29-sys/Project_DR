const Doctor = require('../models/Doctor');

// @desc    Create or update doctor profile
// @route   POST /api/doctors/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { licenseNumber, country, experience, specialization, degrees } = req.body;

        const profileFields = {
            user: req.user.id,
            licenseNumber,
            country,
            experience,
            specialization,
            degrees: Array.isArray(degrees) ? degrees : [],
        };

        let doctor = await Doctor.findOne({ user: req.user.id });

        if (doctor) {
            // Update
            doctor = await Doctor.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.status(200).json({ success: true, data: doctor });
        }

        // Create
        doctor = await Doctor.create(profileFields);
        res.status(201).json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current doctor profile
// @route   GET /api/doctors/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', ['name', 'email']);

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
