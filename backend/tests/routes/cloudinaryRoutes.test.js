const path = require('path');
const request = require('supertest');
const app = require('../../app'); // Your app's entry point

describe('Cloudinary Routes', () => {
    it('should upload a file to Cloudinary', async () => {
        // Path to the manually added test image
        const testImagePath = path.join(__dirname, 'testing-image.jpg');

        // Perform the API call to upload the file
        const response = await request(app)
            .post('/api/cloudinary/upload')
            .attach('file', testImagePath);

        // Assertions to validate the response
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url');
    }, 10000); // Allow 10 seconds for the test to complete
});
