const path = require('path');
const request = require('supertest');
const app = require('../../app'); // Your app's entry point
const mongoose = require('mongoose');

// Mock the Cloudinary library
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(), // Mock the config method
        uploader: {
            upload_stream: jest.fn((options, callback) => {
                // Simulate a successful upload by calling the callback with a mock response
                const mockResponse = {
                    secure_url: 'http://mock-cloudinary-url.com/testing-image.jpg',
                };
                callback(null, mockResponse);
            }),
        },
    },
}));

const { v2: cloudinary } = require('cloudinary');

afterAll(async () => {
    await mongoose.disconnect();
});

describe('Cloudinary Routes', () => {
    it('should upload a file to Cloudinary (mocked)', async () => {
        // Path to the manually added test image
        const testImagePath = path.join(__dirname, 'testing-image.jpg');

        // Perform the API call to upload the file
        const response = await request(app)
            .post('/api/cloudinary/upload')
            .attach('file', testImagePath);

        // Assertions to validate the response
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url', 'http://mock-cloudinary-url.com/testing-image.jpg');

        // Ensure the mock function was called
        expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });
});
