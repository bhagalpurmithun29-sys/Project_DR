const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    diagnosisCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    patientId: {
        type: String,
        unique: true,
    },
    photo: {
        type: String,
        default: '',
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    phoneNumber: {
        type: String,
    },
    diabetesType: {
        type: String,
        required: true,
    },
    hba1c: {
        type: Number,
    },
    lastExamDate: {
        type: Date,
        default: Date.now,
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'High'],
        default: 'Low',
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Patient', patientSchema);
