const { uploadFileToCloudinary } = require('../../../controllers/cloudinaryController');
const cloudinary = require('../../../config/cloudinary');
const streamifier = require('streamifier');

// Mock Cloudinary config and streamifier
jest.mock('../../../config/cloudinary', () => ({
    uploader: {
        upload_stream: jest.fn(),
    },
}));
jest.mock('streamifier', () => ({
    createReadStream: jest.fn(() => ({
        pipe: jest.fn(),
        on: jest.fn((event, callback) => {
            return; // Do nothing for the 'error' event
        })
    }))
}));

describe('CloudinaryController - uploadFileToCloudinary', () => {
    it('should upload a file to Cloudinary successfully', async () => {
        // Mock request and response with all required properties
        const req = {
            file: {
                buffer: Buffer.from('mock file content'),
                originalname: 'test-file.jpg',
                size: 1024, // 1KB
                mimetype: 'image/jpeg'
            },
            body: {
                folder: 'test-folder',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock Cloudinary upload_stream method
        cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
            callback(null, { 
                secure_url: 'http://mock-cloudinary-url.com/file.jpg',
                public_id: 'test-folder/test-file',
                format: 'jpg',
                resource_type: 'image',
                bytes: 1024,
            });
            return {
                on: jest.fn(),
                end: jest.fn()
            };
        });

        // Call the controller
        await uploadFileToCloudinary(req, res);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            url: 'http://mock-cloudinary-url.com/file.jpg',
            public_id: 'test-folder/test-file',
            format: 'jpg',
            resource_type: 'image',
            size: 1024,
            original_filename: 'test-file.jpg'
        });
    }, 10000);

    it('should handle errors during Cloudinary upload', async () => {
        const req = {
            file: {
                buffer: Buffer.from('mock file content'),
                originalname: 'test-file.jpg',
                size: 1024,
                mimetype: 'image/jpeg'
            },
            body: { 
                folder: 'test-folder' 
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Simulate an error in Cloudinary upload
        cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
            callback(new Error('Cloudinary upload failed'), null);
            return {
                on: jest.fn(),
                end: jest.fn()
            };
        });

        // Call the controller
        await uploadFileToCloudinary(req, res);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            error: 'Server error', 
            message: 'Failed to upload file to Cloudinary. Please try again later.'
        });
    }, 10000);
});
