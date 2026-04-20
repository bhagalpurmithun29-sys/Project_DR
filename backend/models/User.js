const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,   // Always store emails in lowercase — makes login case-insensitive
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    role: {
        type: String,
        enum: ['doctor', 'patient', 'technician', 'diagnosis_center'],
    },
    age: {
        type: Number,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: 6,
        select: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    securityQuestions: {
        type: [{
            question: { type: String, required: true },
            answer: { type: String, required: true, select: false }
        }],
        default: [],
        validate: [v => v.length === 0 || v.length === 2, 'Exactly 2 security questions are required for recovery']
    },
    securityQuestionAttempts: {
        type: Number,
        default: 0
    },
    securityQuestionLockUntil: {
        type: Date
    }
});

// Encrypt password using bcrypt before saving user
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
