const express = require('express');
const path = require('path');
const multer = require('multer');
const {
    createScan,
    getScans,
    getScan,
    updateScan,
    analyzeScan,
    generateReportSummary,
    referScan,
    deleteScan
} = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const { upload: cloudinaryUpload } = require('../middleware/cloudinaryConfig');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('doctor', 'technician', 'diagnosis_center'), cloudinaryUpload.single('image'), createScan)
    .get(authorize('doctor', 'diagnosis_center'), getScans);

router.route('/:id')
    .get(getScan)
    .put(authorize('doctor', 'diagnosis_center'), updateScan)
    .delete(authorize('doctor', 'diagnosis_center'), deleteScan);

router.post('/:id/analyze', authorize('doctor', 'diagnosis_center'), analyzeScan);
router.post('/:id/generate-report', authorize('doctor', 'diagnosis_center'), generateReportSummary);
router.post('/:id/refer', authorize('diagnosis_center'), referScan);

module.exports = router;
