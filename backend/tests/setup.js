const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Ensure Mongoose uses Jest's fake timers if enabled
mongoose.set('useJestFakeTimers', true);

// Force test environment
process.env.NODE_ENV = 'test';

// Store the original MongoDB URI to avoid accidentally connecting to it
const originalMongoURI = process.env.MONGODB_URI;
let mongoServer;

beforeAll(async () => {
  console.log('Starting test suite with isolated MongoDB instance');
  
  // Create an in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Replace the real URI with the in-memory one to prevent accidental connections to real DB
  process.env.MONGODB_URI = mongoUri;
  
  // Log which database we're connecting to for debugging
  console.log(`Using test database: ${mongoUri}`);
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect from database and stop the in-memory server
  await mongoose.disconnect();
  await mongoServer.stop();
  
  // Restore the original URI
  process.env.MONGODB_URI = originalMongoURI;
  console.log('Test database connection closed and in-memory MongoDB instance stopped');
});

// Clear all data before each test runs
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) { // Only attempt if connected
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      // Only clear test database collections
      await collection.deleteMany({});
    }
  }
});
