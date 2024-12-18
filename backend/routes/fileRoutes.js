const express = require('express');
const upload = require('../middleware/fileValidator');
const { scanResume } = require('../controllers/resumeScanner');

const router = express.Router();

// Route to handle CV upload with optional resume scanning
router.post('/upload/cv', upload.single('cv'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Invalid file type or no file uploaded.' });
    }
    if (req.query.scan === 'true') {
        return scanResume(req, res);
    }
    res.status(200).json({ message: 'CV uploaded successfully!', file: req.file.path });
});

// Route to handle profile picture upload
router.post('/upload/profile', upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Invalid file type or no file uploaded.' });
    }
    res.status(200).json({ message: 'Profile picture uploaded successfully!', file: req.file.path });
});

module.exports = router;
