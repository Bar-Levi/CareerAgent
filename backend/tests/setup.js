const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Ensure Mongoose uses Jest's fake timers if enabled
mongoose.set('useJestFakeTimers', true);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear all data before each test runs
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
