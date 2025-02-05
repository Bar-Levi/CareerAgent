// convertMongoObject.js

/**
 * Recursively converts a MongoDB document with extended JSON formats
 * (e.g., {$oid: "..."} and {$date: "..."}) into a plain JavaScript object.
 *
 * @param {any} obj - The MongoDB document or value to convert.
 * @returns {any} - The converted plain object or value.
 */
function convertMongoObject(obj) {
    // If the value is an array, recursively convert each element.
    if (Array.isArray(obj)) {
      return obj.map(convertMongoObject);
    }
    
    // If the value is an object (and not null), process its keys.
    if (obj !== null && typeof obj === "object") {
      // Check if it's a special MongoDB object:
      if (obj.$oid) {
        return obj.$oid;
      }
      if (obj.$date) {
        // You can return the ISO string or a Date object.
        // Returning the ISO string:
        return new Date(obj.$date).toISOString();
      }
      
      // Otherwise, create a new object and convert each property recursively.
      const newObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = convertMongoObject(obj[key]);
        }
      }
      return newObj;
    }
    
    // If the value is neither an array nor an object, return it as is.
    return obj;
  }
  
  module.exports = convertMongoObject;
  