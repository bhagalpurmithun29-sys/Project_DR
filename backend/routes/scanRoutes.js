const express = require('express');
const path = require('path');
const multer = require('multer');
const {
    createScan,
    getScans,
    getScan,
    updateScan,
    analyzeScan
} = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `retina-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('doctor', 'technician', 'diagnosis_center'), upload.single('image'), createScan)
    .get(authorize('doctor', 'diagnosis_center'), getScans);

router.route('/:id')
    .get(getScan)
    .put(authorize('doctor', 'diagnosis_center'), updateScan);

router.post('/:id/analyze', authorize('doctor', 'diagnosis_center'), analyzeScan);

module.exports = router;
