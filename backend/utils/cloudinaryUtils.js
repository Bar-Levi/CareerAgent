const extractPublicId = (url) => {
    const cloudName = cloudinary.config().cloud_name;
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    if (!url.startsWith(baseUrl)) return null;
    let publicIdWithExt = url.substring(baseUrl.length); // e.g. "v1735084555/profile_pictures/filename.png"
    // Remove version if present (starts with v followed by digits)
    const parts = publicIdWithExt.split('/');
    if (parts[0].startsWith('v')) {
      parts.shift();
    }
    const publicIdWithExtNoQuery = parts.join('/');
    const dotIndex = publicIdWithExtNoQuery.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? publicIdWithExtNoQuery.substring(0, dotIndex) : publicIdWithExtNoQuery;
    return publicId;
  };
  
  const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Cloudinary destroy error:", error);
          return reject(error);
        }
        return resolve(result);
      });
    });
  };
  
  module.exports = { extractPublicId, deleteFromCloudinary };
  