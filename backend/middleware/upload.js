const multer = require('multer');

// Use memory storage so the file is not saved to disk.
const storage = multer.memoryStorage();
const upload = multer({ storage });
module.exports = upload;
