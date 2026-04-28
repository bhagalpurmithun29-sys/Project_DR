const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for Retinal Scans
const scanStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'retina-scans',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `scan-${Date.now()}-${Math.round(Math.random() * 1E9)}`
  }
});

// Storage for User Profiles & Diagnosis Center Photos
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}`
  }
});

const upload = multer({ storage: scanStorage });
const profileUpload = multer({ storage: profileStorage });

module.exports = { cloudinary, upload, profileUpload };
