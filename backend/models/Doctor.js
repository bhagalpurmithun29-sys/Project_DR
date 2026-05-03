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
        unique: true,
        sparse: true, // Allow multiple nulls/empty if unique
    },
    country: {
        type: String,
    },
    experience: {
        type: String,
    },
    specialization: {
        type: String,
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
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
    bio: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Doctor', doctorSchema);
