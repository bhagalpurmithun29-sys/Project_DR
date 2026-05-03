const express = require('express');
const path = require('path');
const multer = require('multer');
const {
    createOrUpdateProfile,
    getProfile,
    uploadProfilePhoto
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

const { profileUpload } = require('../middleware/cloudinaryConfig');


const router = express.Router();

router.use(protect);

router.post('/profile', createOrUpdateProfile);
router.get('/profile', getProfile);
router.post('/profile/photo', profileUpload.single('photo'), uploadProfilePhoto);

module.exports = router;
