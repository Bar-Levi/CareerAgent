const { uploadFileToCloudinary } = require('../../controllers/cloudinaryController');
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');

// Mock Cloudinary for testing
jest.mock('../../config/cloudinary', () => ({
    uploader: {
        upload_stream: jest.fn(),
    },
}));


describe('CloudinaryController - uploadFileToCloudinary', () => {
    it('should upload a file to Cloudinary successfully', async () => {
        // Mock request and response
        const req = {
            file: {
                buffer: Buffer.from('mock file content'),
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
            callback(null, { secure_url: 'http://mock-cloudinary-url.com/file.jpg' });
        });

        // Call the controller
        await uploadFileToCloudinary(req, res);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ url: 'http://mock-cloudinary-url.com/file.jpg' });
    }, 10000);

    it('should handle errors during Cloudinary upload', async () => {
        const req = {
            file: { buffer: Buffer.from('mock file content') },
            body: { folder: 'test-folder' },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Simulate an error in Cloudinary upload
        cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
            callback(new Error('Cloudinary upload failed'), null);
        });

        // Call the controller
        await uploadFileToCloudinary(req, res);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to upload files to Cloudinary.' });
    }, 10000);
});
