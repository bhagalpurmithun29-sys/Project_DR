const mongoose = require('mongoose');

const diagnosisCenterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    centerName: {
        type: String,
        required: [true, 'Please add a center name'],
    },
    centerId: {
        type: String,
        unique: true,
        sparse: true,
    },
    licenseNumber: {
        type: String,
        default: '',
    },
    centerType: {
        type: String,
        enum: ['Diagnosis Center', 'Lab', 'Optical Center', 'Other'],
        default: 'Diagnosis Center',
    },
    address: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    photo: {
        type: String,
        default: '',
    },
    totalPatients: {
        type: Number,
        default: 0,
    },
    totalScans: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('DiagnosisCenter', diagnosisCenterSchema);
