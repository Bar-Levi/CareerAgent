const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if we're running in test mode - if so, don't connect to the real database
        // as the test environment will handle its own connections
        if (process.env.NODE_ENV === 'test') {
            console.log('\n- Test environment detected. Using test database.\n');
            return; // Don't connect to any database - tests use MongoMemoryServer
        }

        // For non-test environments, connect to the real database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n- MongoDB Connected.\n');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;

