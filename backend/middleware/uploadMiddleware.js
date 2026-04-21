const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'image' ? 'retina' : (file.fieldname === 'photo' ? 'user' : 'file');
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Custom middleware to format the file path for database storage
const formatFilePath = (req, res, next) => {
    if (req.file) {
        // Convert absolute path to relative /uploads/ path for the frontend/server to serve
        req.file.path = `/uploads/${req.file.filename}`;
    }
    next();
};

module.exports = { upload, formatFilePath };
