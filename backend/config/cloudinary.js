const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,       
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});

console.log('\n- Cloudinary configuration updated successfully\n');
// Export the configured instance
module.exports = cloudinary;
