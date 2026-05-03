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
    },
    prediction: {
        type: String,   // e.g. "Proliferate DR", "Mild NPDR"
    },
    aiConfidence: {
        type: Number,   // 0-1 probability value
        default: 0,
    },
    lesionCount: {
        type: Number,
        default: 0,
    },
    lesionPercent: {
        type: Number,
        default: 0,
    },
    technician: {
        type: String,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Analyzed', 'Reviewed'],
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
    findings: {
        type: [String],
        default: [],
    },
    aiReportSummary: {
        type: String,
    },
    diagnosisCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    referredDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    referredAt: {
        type: Date,
    },
    doctorPrescription: {
        type: String,
    },
    sentToPatient: {
        type: Boolean,
        default: false,
    },
    reviewedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Scan', scanSchema);
