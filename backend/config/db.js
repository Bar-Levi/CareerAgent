const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n- MongoDB Connected.\n');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1); // Only exit in non-test environments
        } else {
            throw new Error(error); // Allow Jest to catch the error
        }
    }
};

module.exports = connectDB;

