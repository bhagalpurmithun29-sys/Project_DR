const express = require('express');
const {
    getPatientProfile,
    getPatientScans,
    getMyProfile,
    getPatients,
    createPatient,
    uploadPatientPhoto,
    updateMyProfile,
    updateMyPhoto
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { profileUpload } = require('../middleware/cloudinaryConfig');

const router = express.Router();

router.use(protect);

router.get('/', authorize('doctor', 'technician', 'diagnosis_center'), getPatients);
router.post('/', authorize('doctor', 'diagnosis_center'), createPatient);
router.get('/me', getMyProfile);
router.put('/me/profile', updateMyProfile);
router.put('/me/photo', profileUpload.single('photo'), updateMyPhoto);
router.get('/:id', getPatientProfile);
router.post('/:id/photo', profileUpload.single('photo'), uploadPatientPhoto);
router.get('/:id/scans', getPatientScans);

module.exports = router;
