const express = require('express');
const {
    createOrUpdateProfile,
    getProfile
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/profile', createOrUpdateProfile);
router.get('/profile', getProfile);

module.exports = router;
