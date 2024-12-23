const express = require('express');
const multer = require('multer');
const { uploadFileToCloudinary } = require('../controllers/cloudinaryController');

const router = express.Router();
const upload = multer();

// Route for uploading files
router.post('/upload', upload.single('file'), uploadFileToCloudinary);

module.exports = router;
