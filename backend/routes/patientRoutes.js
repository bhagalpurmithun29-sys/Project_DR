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
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

const router = express.Router();

router.use(protect);

router.get('/', authorize('doctor', 'technician', 'diagnosis_center'), getPatients);
router.post('/', authorize('doctor', 'diagnosis_center'), createPatient);
router.get('/me', getMyProfile);
router.put('/me/profile', updateMyProfile);
router.put('/me/photo', upload.single('photo'), updateMyPhoto);
router.get('/:id', getPatientProfile);
router.post('/:id/photo', upload.single('photo'), uploadPatientPhoto);
router.get('/:id/scans', getPatientScans);

module.exports = router;
