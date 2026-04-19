const MedicalResource = require('../models/MedicalResource');

// @desc    Get all medical resources
// @route   GET /api/medical-resources
exports.getAllResources = async (req, res) => {
    try {
        const resources = await MedicalResource.find().sort({ order: 1 });
        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: Unable to fetch resources'
        });
    }
};

// @desc    Get resources by category (stage, primer, etc)
// @route   GET /api/medical-resources/category/:category
exports.getResourcesByCategory = async (req, res) => {
    try {
        const resources = await MedicalResource.find({ category: req.params.category }).sort({ order: 1 });
        res.status(200).json({
            success: true,
            data: resources
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
