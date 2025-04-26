const express = require('express');
const multer = require('multer');
const { uploadFileToCloudinary } = require('../controllers/cloudinaryController');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB in bytes
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload images, PDFs, or Word documents.'), false);
    }
  }
});

// Route for uploading files without authentication
router.post('/upload', upload.single('file'), uploadFileToCloudinary);

module.exports = router;
