// Set the environment to test
process.env.NODE_ENV = 'test';

// This will run before any tests execute
console.log('Jest setup: Setting NODE_ENV to "test"');

// Store original MongoDB URI to help prevent accidental use of real database
if (process.env.MONGODB_URI) {
  process.env.REAL_MONGODB_URI = process.env.MONGODB_URI;
  console.log('Original MONGODB_URI saved for reference. Tests will use in-memory database.');
} 