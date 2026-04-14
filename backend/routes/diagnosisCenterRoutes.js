const express = require('express');
const path = require('path');
const multer = require('multer');
const { getMyCenter, updateMyCenter, getAllCenters, uploadCenterPhoto } = require('../controllers/diagnosisCenterController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `center-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.use(protect);

router.get('/me', getMyCenter);
router.put('/me', updateMyCenter);
router.get('/', authorize('doctor', 'diagnosis_center'), getAllCenters);
router.post('/me/photo', upload.single('photo'), uploadCenterPhoto);

module.exports = router;
