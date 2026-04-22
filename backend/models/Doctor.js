const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'Please add a medical license number'],
        unique: true,
    },
    country: {
        type: String,
        required: [true, 'Please add a country of registration'],
    },
    experience: {
        type: String,
        required: [true, 'Please add years of clinical experience'],
    },
    specialization: {
        type: String,
        required: [true, 'Please add a primary specialization'],
    },
    email: {
        type: String,
        required: [true, 'Please add a Doctor email'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a mobile number'],
    },
    degrees: [
        {
            title: String,
            institution: String,
        }
    ],
    photo: {
        type: String,
        default: 'default-doctor.jpg',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Doctor', doctorSchema);
