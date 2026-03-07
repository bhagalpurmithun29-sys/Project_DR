const express = require('express');
const {
    getPatientProfile,
    getPatientScans,
    getMyProfile
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.get('/:id', getPatientProfile);
router.get('/:id/scans', getPatientScans);

module.exports = router;
