const express = require('express');
const path = require('path');
const multer = require('multer');
const {
    createOrUpdateProfile,
    getProfile,
    uploadProfilePhoto
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.use(protect);

router.post('/profile', createOrUpdateProfile);
router.get('/profile', getProfile);
router.post('/profile/photo', upload.single('photo'), uploadProfilePhoto);

module.exports = router;
