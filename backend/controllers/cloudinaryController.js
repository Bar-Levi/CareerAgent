const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Helper to determine the proper resource type for Cloudinary
const getResourceType = (mimetype) => {
    // For DOCX and DOC files, Cloudinary requires 'raw' as the resource type
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword' ||
        mimetype === 'text/plain' ||
        mimetype === 'application/pdf') {
        return 'raw';
    }
    // For images, use 'image'
    return 'auto';
};

const uploadFileToCloudinary = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded', message: 'Please select a file to upload.' });
        }

        // Log detailed information about the file being uploaded
        console.log("File upload request received:", {
            filename: req.file.originalname,
            size: `${(req.file.size / 1024).toFixed(2)} KB`,
            mimetype: req.file.mimetype,
            folder: req.body.folder || 'uploads'
        });

        // Check file size
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ 
                error: 'File too large', 
                message: `Maximum file size is 2MB. Received ${(req.file.size / (1024 * 1024)).toFixed(2)}MB.` 
            });
        }

        // Determine the appropriate resource type based on MIME type
        const resourceType = getResourceType(req.file.mimetype);
        
        // Extract file extension from the original filename
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        // Increase timeout to 30 seconds for larger files or slow connections
        const UPLOAD_TIMEOUT = 30000; // 30 seconds

        // Handle single file upload to Cloudinary with an extended timeout
        const result = await Promise.race([
            new Promise((resolve, reject) => {
                console.log("Starting Cloudinary upload...", {
                    resourceType,
                    fileExtension,
                    origMimeType: req.file.mimetype
                });
                const startTime = Date.now();
                
                const uploadStream = cloudinary.uploader.upload_stream(
                    { 
                        folder: req.body.folder || 'uploads',
                        resource_type: resourceType, // Use appropriate resource type based on file
                        format: fileExtension,  // Ensure format is preserved
                        use_filename: true,     // Use original filename
                        unique_filename: true,  // Ensure filenames don't conflict
                        overwrite: false,       // Don't overwrite existing files
                    },
                    (error, result) => {
                        const uploadTime = Date.now() - startTime;
                        if (error) {
                            console.error(`Cloudinary upload failed after ${uploadTime}ms:`, error);
                            reject(error);
                        } else {
                            console.log(`Cloudinary upload successful after ${uploadTime}ms for ${result.public_id}`);
                            resolve(result);
                        }
                    }
                );

                // Create readable stream from file buffer and pipe to Cloudinary
                const fileStream = streamifier.createReadStream(req.file.buffer);
                
                // Add error handler to the file stream
                fileStream.on('error', (err) => {
                    console.error('Error in file stream:', err);
                    reject(err);
                });
                
                fileStream.pipe(uploadStream);
            }),
            new Promise((_, reject) => 
                setTimeout(() => {
                    console.error(`Upload timeout after ${UPLOAD_TIMEOUT/1000} seconds`);
                    reject(new Error(`Upload timeout after ${UPLOAD_TIMEOUT/1000} seconds`));
                }, UPLOAD_TIMEOUT)
            )
        ]);

        console.log("Cloudinary upload completed:", {
            publicId: result.public_id,
            url: result.secure_url,
            size: `${(result.bytes / 1024).toFixed(2)} KB`,
            format: result.format,
            resourceType: result.resource_type,
            originalFilename: req.file.originalname
        });

        // Respond with the Cloudinary URL and additional metadata
        res.status(200).json({ 
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            resource_type: result.resource_type,
            size: result.bytes,
            original_filename: req.file.originalname
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        
        // Send an appropriate error response based on the error
        if (error.message && error.message.includes('timeout after')) {
            return res.status(408).json({ 
                error: 'Request timeout', 
                message: 'The upload process took too long. This may be due to network issues. Please try again or use a smaller file.'
            });
        }

        // Handle file type errors from multer
        if (error.message && error.message.includes('Unsupported file type')) {
            return res.status(415).json({
                error: 'Unsupported Media Type',
                message: error.message
            });
        }
        
        // Check for specific Cloudinary errors
        if (error.http_code) {
            return res.status(error.http_code).json({ 
                error: error.message, 
                message: 'Failed to upload file to Cloudinary. Please check your file and try again.'
            });
        }
        
        res.status(500).json({ 
            error: 'Server error', 
            message: 'Failed to upload file to Cloudinary. Please try again later.'
        });
    }
};

module.exports = { uploadFileToCloudinary };
