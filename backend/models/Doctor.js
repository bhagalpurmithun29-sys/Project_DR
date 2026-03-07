const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
