const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n- MongoDB Connected.\n');
    } catch (error) {
        process.exit(1);
    }
};

module.exports = connectDB;

