const express = require('express');
const path = require('path');
const multer = require('multer');
const { getMyCenter, updateMyCenter, getAllCenters, uploadCenterPhoto } = require('../controllers/diagnosisCenterController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const { profileUpload: cloudinaryProfileUpload } = require('../middleware/cloudinaryConfig');

const router = express.Router();

router.use(protect);

router.get('/me', getMyCenter);
router.put('/me', updateMyCenter);
router.get('/', authorize('doctor', 'diagnosis_center'), getAllCenters);
router.post('/me/photo', cloudinaryProfileUpload.single('photo'), uploadCenterPhoto);

module.exports = router;
