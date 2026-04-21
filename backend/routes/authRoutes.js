const express = require('express');
const path = require('path');
const multer = require('multer');
const { registerUser, loginUser, googleLogin, getMe, changePassword, setPassword, forgotPassword, resetPassword, getSecurityQuestions, verifySecurityQuestions, updateSecurityQuestions, uploadUserPhoto, deleteAccount, getDoctorsList } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { upload, formatFilePath } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/set-password', protect, setPassword);
router.put('/security-questions', protect, updateSecurityQuestions);
router.post('/photo', protect, upload.single('photo'), formatFilePath, uploadUserPhoto);
router.delete('/delete-account', protect, deleteAccount);
router.get('/doctors', protect, getDoctorsList);

// Password Reset Flow
router.post('/forgot-password', forgotPassword); // Used for email link if desired
router.post('/security-questions', getSecurityQuestions);
router.post('/verify-security-questions', verifySecurityQuestions);
router.post('/reset-password', resetPassword);


module.exports = router;
