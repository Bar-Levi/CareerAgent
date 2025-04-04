const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const extractPublicId = (url) => {
    // Check if it's a valid Cloudinary URL
    if (!url.includes('cloudinary.com')) return null;
    
    // Extract everything after 'image/upload/'
    const parts = url.split('image/upload/');
    if (parts.length !== 2) return null;
    
    let publicIdWithExt = parts[1];
    
    // Remove version if present (starts with v followed by digits)
    const pathParts = publicIdWithExt.split('/');
    if (pathParts[0].startsWith('v')) {
        pathParts.shift();
    }
    
    const publicIdWithExtNoQuery = pathParts.join('/');
    const dotIndex = publicIdWithExtNoQuery.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? publicIdWithExtNoQuery.substring(0, dotIndex) : publicIdWithExtNoQuery;
    return publicId;
};

const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
        console.log(`Attempting to delete Cloudinary resource: ${publicId}`);
        
        // First delete the resource
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error("❌ Cloudinary deletion failed:", error.message);
                return reject(error);
            }

            console.log("✅ Successfully deleted from Cloudinary:", result);

            // Then invalidate the cache
            cloudinary.api.delete_resources([publicId], { invalidate: true }, (invalidateError) => {
                if (invalidateError) {
                    console.error("⚠️ Cache invalidation failed:", invalidateError.message);
                    // Don't reject here, as the file was already deleted
                } else {
                    console.log("✅ Successfully invalidated cache");
                }
                return resolve(result);
            });
        });
    });
};

module.exports = { extractPublicId, deleteFromCloudinary };
