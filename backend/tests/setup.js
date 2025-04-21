const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const { cleanupTask } = require('../tasks/cleanupTokens'); // No longer needed here

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
  // Cron task stopped in individual test suites that require server.js
  // if (cleanupTask) {
  //   cleanupTask.stop(); 
  //   console.log('Stopped cleanup task for tests.');
  // }
});

// Clear all data before each test runs
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Optional: Clear all data between tests if needed
// beforeEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     await collection.deleteMany();
//   }
// }); 