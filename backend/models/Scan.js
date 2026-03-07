const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    aiResult: {
        type: String,
        required: true,
    },
    lesionCount: {
        type: Number,
        default: 0,
    },
    technician: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed'],
        default: 'Pending',
    },
    eyeSide: {
        type: String,
        enum: ['OD', 'OS'], // OD: Right, OS: Left
        default: 'OD',
    },
    scanId: {
        type: String,
        required: true,
        unique: true,
    },
    insights: [
        {
            type: {
                type: String,
            },
            message: {
                type: String,
            },
        },
    ],
    clinicalNotes: {
        type: String,
    },
    doctorSignature: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Scan', scanSchema);
