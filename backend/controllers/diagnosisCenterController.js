const DiagnosisCenter = require('../models/DiagnosisCenter');

// @desc    Get logged-in center's own profile
// @route   GET /api/diagnosis-centers/me
// @access  Private/DiagnosisCenter
exports.getMyCenter = async (req, res) => {
    try {
        const center = await DiagnosisCenter.findOne({ user: req.user.id });
        if (!center) {
            return res.status(404).json({ success: false, message: 'Diagnosis center profile not found' });
        }
        res.json({ success: true, data: center });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update logged-in center's own profile
// @route   PUT /api/diagnosis-centers/me
// @access  Private/DiagnosisCenter
exports.updateMyCenter = async (req, res) => {
    try {
        const { centerName, licenseNumber, centerType, address, city, phone, email } = req.body;
        const center = await DiagnosisCenter.findOne({ user: req.user.id });
        if (!center) {
            return res.status(404).json({ success: false, message: 'Diagnosis center profile not found' });
        }
        if (centerName)    center.centerName    = centerName;
        if (licenseNumber) center.licenseNumber = licenseNumber;
        if (centerType)    center.centerType    = centerType;
        if (address)       center.address       = address;
        if (city)          center.city          = city;
        if (phone)         center.phone         = phone;
        if (email)         center.email         = email;
        await center.save();
        res.json({ success: true, data: center });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all diagnosis centers (for doctors/admin)
// @route   GET /api/diagnosis-centers
// @access  Private/Doctor
exports.getAllCenters = async (req, res) => {
    try {
        const centers = await DiagnosisCenter.find().populate('user', 'name email').sort('-createdAt');
        res.json({ success: true, count: centers.length, data: centers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload profile photo
// @route   POST /api/diagnosis-centers/me/photo
// @access  Private/DiagnosisCenter
exports.uploadCenterPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const photoUrl = `/uploads/${req.file.filename}`;

        const center = await DiagnosisCenter.findOneAndUpdate(
            { user: req.user.id },
            { $set: { photo: photoUrl } },
            { new: true }
        ).populate('user', ['name', 'email']);

        if (!center) {
            return res.status(404).json({ success: false, message: 'Diagnosis center profile not found' });
        }

        res.status(200).json({ success: true, data: center });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
