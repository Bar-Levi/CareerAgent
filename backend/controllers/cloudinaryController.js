const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadFileToCloudinary = async (req, res) => {
    try {
        // Handle single file upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: req.body.folder || 'uploads' }, // Use folder from request or default to 'uploads'
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Pipe the uploaded file buffer to the Cloudinary upload stream
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        // Respond with the Cloudinary URL
        res.status(200).json({ url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload files to Cloudinary.' });
    }
};

module.exports = { uploadFileToCloudinary };
