const path = require('path');
const request = require('supertest');
const { app, server } = require('../../../server'); // Correct path relative to tests/integration/routes
const mongoose = require('mongoose');
const { cleanupTask } = require('../../../tasks/cleanupTokens'); // Correct path

// Mock the entire cloudinaryController
jest.mock('../../../controllers/cloudinaryController', () => ({
  uploadFileToCloudinary: jest.fn((req, res) => {
    // Simple mock implementation that always returns success
    return res.status(200).json({ 
      url: 'http://mock-cloudinary-url.com/testing-image.jpg',
      public_id: 'test-folder/test-image',
      format: 'jpg',
      resource_type: 'image',
      size: 52000,
      original_filename: req.file ? req.file.originalname : 'unknown.jpg'
    });
  })
}));

// Get the mocked controller for assertions
const cloudinaryController = require('../../../controllers/cloudinaryController');

// Close the server and database connection after all tests
afterAll(async () => {
  // Close the server connection first
  if (server && server.close) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Server closed for cloudinaryRoutes tests.');
        resolve();
      });
    });
  }
  
  // Stop the cron task to avoid Jest open handle errors
  if (cleanupTask && cleanupTask.stop) {
    cleanupTask.stop();
    console.log('Stopped cleanup task for cloudinaryRoutes tests.');
  }

  // Finally disconnect from MongoDB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Mongoose disconnected for cloudinaryRoutes tests.');
  }
});

describe('Cloudinary Routes', () => {
  jest.setTimeout(10000); // Increase timeout for this test suite

  it('should upload a file to Cloudinary (mocked)', async () => {
    // Path to the test image
    const testImagePath = path.join(__dirname, 'testing-image.jpg');

    // Send the request
    const response = await request(app)
      .post('/api/cloudinary/upload')
      .attach('file', testImagePath)
      .timeout(5000);  // Set a timeout for the request

    // Assertions to validate the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url', 'http://mock-cloudinary-url.com/testing-image.jpg');
    
    // Verify the controller was called
    expect(cloudinaryController.uploadFileToCloudinary).toHaveBeenCalled();
  });
});
