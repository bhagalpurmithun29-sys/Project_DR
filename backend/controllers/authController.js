const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const DiagnosisCenter = require('../models/DiagnosisCenter');
const Doctor = require('../models/Doctor');
const Scan = require('../models/Scan');
const Notification = require('../models/Notification');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Helper
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, age } = req.body;

        // Validation regex patterns
        // Email: Must contain alphabet, number and @ sign
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // Password: Upper, Lower, Numeric, Special, 8-12 chars
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be 8-12 characters and include uppercase, lowercase, numbers, and a special character.'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
            age: age || 0,
        });

        if (user) {
            // If patient → create Patient profile
            if (user.role === 'patient') {
                const patientId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
                await Patient.create({
                    user: user._id,
                    name: user.name,
                    patientId,
                    email: user.email,
                    age: age || 0,
                    diabetesType: 'Type 2'
                });
            }
            // If diagnosis center → create DiagnosisCenter profile
            if (user.role === 'diagnosis_center') {
                const centerId = `DC-${Math.floor(100000 + Math.random() * 900000)}`;
                await DiagnosisCenter.create({
                    user: user._id,
                    centerName: user.name,
                    centerId,
                    email: user.email,
                });
            }

            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    requiresSecuritySetup: true,
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate email and password presence
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user (need to select password as it is false by default in schema)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // --- Role Validation Check ---
        if (role) {
            let isRoleValid = false;
            if (role === 'doctor') {
                // 'doctor' tab allows both 'doctor' and 'technician' roles
                isRoleValid = (user.role === 'doctor' || user.role === 'technician');
            } else {
                // For 'patient' and 'diagnosis_center', roles must match exactly
                isRoleValid = (user.role === role);
            }

            if (!isRoleValid) {
                const roleLabels = {
                    'doctor': 'Clinician',
                    'patient': 'Patient',
                    'diagnosis_center': 'Diagnosis Center'
                };
                return res.status(401).json({
                    success: false,
                    message: `This account is registered as a ${user.role.replace('_', ' ')}. Please use the correct tab to sign in.`
                });
            }
        }
        // -----------------------------

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is set in authMiddleware wrapper
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Change password for logged-in user
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, securityQuestions } = req.body;

        if (!currentPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current password' });
        }

        // Fetch user with password field
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        let updated = false;

        // Update password if provided
        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
            }
            if (currentPassword === newPassword) {
                return res.status(400).json({ success: false, message: 'New password must differ from current password' });
            }
            user.password = newPassword;
            updated = true;
        }

        // Update security questions if provided
        if (securityQuestions) {
            if (!Array.isArray(securityQuestions) || securityQuestions.length !== 2) {
                return res.status(400).json({ success: false, message: 'Exactly 2 security questions are required' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedQuestions = await Promise.all(securityQuestions.map(async (sq) => {
                if (!sq.question || !sq.answer) {
                    throw new Error('Question and answer are required for both entries');
                }
                return {
                    question: sq.question,
                    answer: await bcrypt.hash(sq.answer.toLowerCase().trim(), salt)
                };
            }));

            user.securityQuestions = hashedQuestions;
            updated = true;
        }

        if (!updated) {
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }

        await user.save();

        res.json({ success: true, message: 'Security details updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Reset password to a temporary value (password recovery)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Generic message to avoid account enumeration
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate a simple reset token (6-digit code) and store hashed in DB
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = resetCode;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        // In production: send email with resetCode. Here we return it directly for demo.
        res.json({
            success: true,
            message: 'A 6-digit reset code has been generated.',
            resetCode, // ⚠️ For demo only — remove in production and email the code instead
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Confirm reset code and set new password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, token, and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired security token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Security Questions for a user
// @route   POST /api/auth/security-questions
// @access  Public
exports.getSecurityQuestions = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });

        // Prevent enumeration by sending generic error if not found or if user lacks questions
        if (!user || !user.securityQuestions || user.securityQuestions.length !== 2) {
            return res.status(404).json({ success: false, message: 'Account not found or no security questions set.' });
        }

        const questions = user.securityQuestions.map(sq => sq.question);

        res.json({
            success: true,
            data: questions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Security Questions and return a Reset Token
// @route   POST /api/auth/verify-security-questions
// @access  Public
exports.verifySecurityQuestions = async (req, res) => {
    try {
        const { email, answers } = req.body;
        if (!email || !answers || answers.length !== 2) {
            return res.status(400).json({ success: false, message: 'Please provide email and exactly 2 answers.' });
        }

        // We explicitly select securityQuestions.answer by default mongoose doesn't exclude subdocument fields unless specified but let's select full user + questions + answers.
        const user = await User.findOne({ email }).select('+securityQuestions.answer +securityQuestionAttempts +securityQuestionLockUntil');

        if (!user || !user.securityQuestions || user.securityQuestions.length !== 2) {
            return res.status(404).json({ success: false, message: 'Account not found or no security questions set.' });
        }

        // Check if locked
        if (user.securityQuestionLockUntil && user.securityQuestionLockUntil > Date.now()) {
            return res.status(429).json({ success: false, message: 'Too many attempts. Account locked temporarily for recovery.' });
        } else if (user.securityQuestionLockUntil && user.securityQuestionLockUntil <= Date.now()) {
            // Unlock
            await User.updateOne({ _id: user._id }, {
                $unset: { securityQuestionLockUntil: 1 },
                $set: { securityQuestionAttempts: 0 }
            });
            user.securityQuestionAttempts = 0;
            user.securityQuestionLockUntil = undefined;
        }

        // Verify answers
        const isMatch1 = await bcrypt.compare(answers[0].toLowerCase().trim(), user.securityQuestions[0].answer);
        const isMatch2 = await bcrypt.compare(answers[1].toLowerCase().trim(), user.securityQuestions[1].answer);

        if (!isMatch1 || !isMatch2) {
            user.securityQuestionAttempts += 1;

            let updatePayload = { securityQuestionAttempts: user.securityQuestionAttempts };

            // Lock out after 5 attempts for 15 minutes
            if (user.securityQuestionAttempts >= 5) {
                user.securityQuestionLockUntil = Date.now() + 15 * 60 * 1000;
                updatePayload.securityQuestionLockUntil = user.securityQuestionLockUntil;
            }

            await User.updateOne({ _id: user._id }, { $set: updatePayload });
            return res.status(401).json({ success: false, message: 'Incorrect answers. Please try again.' });
        }

        // Generate a 6-digit verification code token for password reset
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        await User.updateOne({ _id: user._id }, {
            $set: {
                securityQuestionAttempts: 0,
                resetPasswordToken: resetToken,
                resetPasswordExpire: Date.now() + 15 * 60 * 1000
            },
            $unset: { securityQuestionLockUntil: 1 }
        });

        res.json({
            success: true,
            resetToken,
            message: 'Security questions verified successfully.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    try {
        const { idToken, accessToken, role } = req.body;
        let sub, email, name, picture;

        if (idToken) {
            // Verify ID Token (OIDC)
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            sub = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else if (accessToken) {
            // Verify Access Token by calling Google UserInfo API
            const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
            const data = response.data;
            sub = data.sub;
            email = data.email;
            name = data.name;
            picture = data.picture;
        } else {
            return res.status(400).json({ success: false, message: 'ID Token or Access Token is required' });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account must have an email associated' });
        }

        let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            // New user via Google
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                role: role || 'patient',
            });

            // Handle Profile Creation (Copied logic from registerUser)
            if (user.role === 'patient') {
                const patientId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
                await Patient.create({
                    user: user._id,
                    name: user.name,
                    patientId,
                    email: user.email,
                    age: 0,
                    diabetesType: 'Type 2'
                });
            }
            if (user.role === 'diagnosis_center') {
                const centerId = `DC-${Math.floor(100000 + Math.random() * 900000)}`;
                await DiagnosisCenter.create({
                    user: user._id,
                    centerName: user.name,
                    centerId,
                    email: user.email,
                });
            }
        } else {
            // --- Role Validation Check for existing Google users ---
            if (role) {
                let isRoleValid = false;
                if (role === 'doctor') {
                    isRoleValid = (user.role === 'doctor' || user.role === 'technician');
                } else {
                    isRoleValid = (user.role === role);
                }

                if (!isRoleValid) {
                    return res.status(401).json({
                        success: false,
                        message: `This account is already registered as a ${user.role.replace('_', ' ')}. Please use the correct tab to sign in.`
                    });
                }
            }
            // -------------------------------------------------------

            // Update social info if not present
            let updated = false;
            if (!user.googleId) {
                user.googleId = sub;
                updated = true;
            }
            if (!user.avatar && picture) {
                user.avatar = picture;
                updated = true;
            }
            if (updated) await user.save();
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                requiresSecuritySetup: isNewUser,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            message: 'Google authentication failed: ' + (error.response?.data?.error_description || error.message)
        });
    }
};

// @desc    Update Security Questions for logged-in user
// @route   PUT /api/auth/security-questions
// @access  Private
exports.updateSecurityQuestions = async (req, res) => {
    try {
        const { securityQuestions, password } = req.body;

        if (!securityQuestions || securityQuestions.length !== 2) {
            return res.status(400).json({ success: false, message: 'Exactly 2 security questions and answers are required.' });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Optional: Verify password for sensitive change
        if (password) {
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }
        }

        // Hash the answers
        const salt = await bcrypt.genSalt(10);
        const hashedQuestions = await Promise.all(securityQuestions.map(async (sq) => ({
            question: sq.question,
            answer: await bcrypt.hash(sq.answer.toLowerCase().trim(), salt)
        })));

        user.securityQuestions = hashedQuestions;
        await user.save();

        res.json({
            success: true,
            message: 'Security questions updated successfully.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Upload user profile photo
// @route   POST /api/auth/photo
// @access  Private
exports.uploadUserPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Save the file path in the avatar field
        // Note: In production you would probably delete the old file if it exists
        const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        user.avatar = photoUrl;
        await user.save();

        res.json({
            success: true,
            data: user,
            message: 'Profile photo updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: 'Please provide your password to confirm deletion' });
        }

        // 1. Fetch user with password
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Deletion cancelled.' });
        }

        const role = user.role;
        const userId = user._id;

        // 3. Delete role-specific data
        if (role === 'patient') {
            const patients = await Patient.find({ user: userId });
            if (patients && patients.length > 0) {
                const patientIds = patients.map(p => p._id);
                // Delete all scans for all profiles of this patient
                await Scan.deleteMany({ patient: { $in: patientIds } });
                // Delete all patient profiles
                await Patient.deleteMany({ user: userId });
            }
        } else if (role === 'doctor') {
            await Doctor.deleteOne({ user: userId });
        } else if (role === 'diagnosis_center') {
            await DiagnosisCenter.deleteOne({ user: userId });
        }

        // 4. Delete common data (notifications)
        await Notification.deleteMany({ user: userId });

        // 5. Finally delete the user account
        await User.deleteOne({ _id: userId });

        res.json({
            success: true,
            message: 'Your account and all associated data have been permanently deleted.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all users with the role 'doctor'
 * @route   GET /api/auth/doctors
 * @access  Private/DiagnosisCenter
 */
exports.getDoctorsList = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name email avatar');
        res.json({
            success: true,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
