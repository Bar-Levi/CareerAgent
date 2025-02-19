const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const jobSeekerModel = require('../models/jobSeekerModel');
const recruiterModel = require('../models/recruiterModel');
const jobListingModel = require('../models/jobListingModel'); // Import JobListing model

const defaultProfilePic = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";

/**
 * Helper function to extract Cloudinary public_id from the secure_url.
 * Assumes the URL is in the standard format. 
 * Returns: "profile_pictures/filename"
 */
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

/**
 * Wrap Cloudinary's destroy method in a Promise.
 */
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

/**
 * Controller to change a user's password.
 * Expects:
 * - email: the user's unique email.
 * - oldPassword: the user's current password.
 * - newPassword: the new password the user wants to set.
 * 
 * Searches the user by its email.
 */
const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Email, old password and new password are required." });
    }
    let user = await jobSeekerModel.findOne({ email });
    if (!user) {
      user = await recruiterModel.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot equal the old password." });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "New password does not meet the required criteria: Password must include uppercase, lowercase, a number, and be at least 8 characters long."
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to change a user's profile picture.
 * Expects:
 * - email: the user's unique email.
 * - A file uploaded via multer (available in req.file).
 * 
 * Searches the user by its email.
 */
const changeProfilePic = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    let user = await jobSeekerModel.findOne({ email });
    if (!user) {
      user = await recruiterModel.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Delete current profile picture from Cloudinary if not default
    if (user.profilePic && user.profilePic !== defaultProfilePic) {
      const publicId = extractPublicId(user.profilePic);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error("Failed to delete old image from Cloudinary:", error);
          // Proceed even if deletion fails
        }
      }
    }
    // Upload new file via Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_pictures" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Failed to upload file." });
        }
        user.profilePic = result.secure_url;
        await user.save();
        // If the user is a recruiter, update all job listings with the new recruiterProfileImage
        if (user.role === "recruiter") {
          await jobListingModel.updateMany(
            { recruiterId: user._id },
            { recruiterProfileImage: result.secure_url }
          );
        }
        return res.status(200).json({ message: "Profile picture updated successfully.", profilePic: result.secure_url });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to delete a user's profile picture.
 * Expects:
 * - email: the user's unique email.
 * 
 * Resets the profilePic field to the default URL.
 * Searches the user by its email.
 */
const deleteProfilePic = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    let user = await jobSeekerModel.findOne({ email });
    if (!user) {
      user = await recruiterModel.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Delete current profile picture from Cloudinary if not default
    if (user.profilePic && user.profilePic !== defaultProfilePic) {
      const publicId = extractPublicId(user.profilePic);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error("Failed to delete old image from Cloudinary:", error);
          // Proceed even if deletion fails
        }
      }
    }
    user.profilePic = defaultProfilePic;
    await user.save();
    // If the user is a recruiter, update job listings with the default profile pic
    if (user.role === "recruiter") {
      await jobListingModel.updateMany(
        { recruiterId: user._id },
        { recruiterProfileImage: defaultProfilePic }
      );
    }
    return res.status(200).json({ message: "Profile picture deleted successfully.", profilePic: defaultProfilePic });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to get the current profile picture URL for the user.
 * Expects:
 * - email: the user's unique email.
 * 
 * Searches the user by its email.
 */
const getNameAndProfilePic = async (req, res) => {
  try {
    console.log("getNameAndProfilePic");
    // Destructure email and id from the query parameters.
    const { email, id } = req.query;
    let user = null;

    // If email is provided, search by email.
    if (email) {
      user =
        (await jobSeekerModel.findOne({ email })) ||
        (await recruiterModel.findOne({ email }));
    }
    // If email is not provided but id is provided, search by id.
    else if (id) {
      user =
        (await jobSeekerModel.findOne({ _id: id })) ||
        (await recruiterModel.findOne({ _id: id }));
    } else {
      // Neither email nor id provided.
      return res
        .status(400)
        .json({ message: "Email or ID is required to fetch profile picture." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log("DATA -");
    console.log({ profilePic: user.profilePic, name: user.fullName} );
    return res.status(200).json({ profilePic: user.profilePic, name: user.fullName});
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to get personal details for a jobseeker.
 * Expects:
 * - email: the user's unique email (via query).
 * - type: (optional) the specific detail to retrieve ("github", "linkedin", "phone", or "dob").
 * 
 * If type is provided, returns the corresponding detail.
 * If not, returns all available personal details.
 */
const getJobSeekerPersonalDetails = async (req, res) => {
  try {
    const { email, type } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    // Find the user in the jobSeeker collection only.
    const user = await jobSeekerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Jobseeker not found." });
    }
    // Decide what to return based on the type parameter.
    if (type) {
      let detail;
      switch (type.toLowerCase()) {
        case "github":
          detail = user.githubUrl;
          break;
        case "linkedin":
          detail = user.linkedinUrl;
          break;
        case "phone":
          detail = user.phone;
          break;
        case "dob":
          detail = user.dateOfBirth;
          break;
        default:
          return res.status(400).json({ message: "Invalid detail type. Valid types: github, linkedin, phone, dob." });
      }
      return res.status(200).json({ [type]: detail });
    } else {
      // If no type is provided, return all details.
      return res.status(200).json({
        github: user.githubUrl,
        linkedin: user.linkedinUrl,
        phone: user.phone,
        dob: user.dateOfBirth
      });
    }
  } catch (error) {
    console.error("Error fetching personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to update a jobseeker's personal detail.
 * Expects:
 * - email: the user's unique email (in req.body).
 * - type: the detail type to update ("github", "linkedin", "phone", or "dob").
 * - value: the new value to set.
 * 
 * Validates the new value and updates the corresponding field.
 * For "dob", the date is formatted as a nicely formatted string, e.g. "January 1, 2020".
 */
const updateJobSeekerPersonalDetails = async (req, res) => {
  try {
    const { email, type, value } = req.body;
    if (!email || !type || value === undefined) {
      return res.status(400).json({ message: "Email, type, and value are required." });
    }
    // Find the jobseeker by email.
    const user = await jobSeekerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Jobseeker not found." });
    }

    // Validate and update based on the type.
    switch (type.toLowerCase()) {
      case "github":
        // Validate GitHub URL (must start with https://github.com/)
        if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+$/.test(value.trim())) {
          return res.status(400).json({ message: "Invalid GitHub URL." });
        }
        user.githubUrl = value.trim();
        break;
      case "linkedin":
        // Validate LinkedIn URL (must start with https://www.linkedin.com/in/)
        if (!/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/.test(value.trim())) {
          return res.status(400).json({ message: "Invalid LinkedIn URL." });
        }
        user.linkedinUrl = value.trim();
        break;
      case "phone":
        // Validate phone number (allow optional + and 7-15 digits)
        if (!/^\+?[0-9]{7,15}$/.test(value.trim())) {
          return res.status(400).json({ message: "Invalid phone number." });
        }
        user.phone = value.trim();
        break;
      case "dob":
        // Validate date of birth: check if it's a valid date and not in the future.
        const parsedDate = Date.parse(value);
        if (isNaN(parsedDate)) {
          return res.status(400).json({ message: "Invalid date of birth." });
        }
        const dobDate = new Date(parsedDate);
        if (dobDate > new Date()) {
          return res.status(400).json({ message: "Date of birth cannot be in the future." });
        }
        // Format the date as a nicely formatted string, e.g. "January 1, 2020"
        const formattedDate = dobDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        user.dateOfBirth = formattedDate;
        break;
      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: github, linkedin, phone, dob." });
    }

    await user.save();
    return res.status(200).json({ message: "Personal detail updated successfully." , updatedUser: user});
  } catch (error) {
    console.error("Error updating personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to reset a jobseeker's personal detail.
 * Expects:
 * - email: the user's unique email (in req.body).
 * - type: the detail type to reset ("github", "linkedin", "phone", or "dob").
 * 
 * Sets the corresponding field to an empty string and returns a dynamic message.
 */
const resetJobSeekerPersonalDetails = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required." });
    }
    // Find the jobseeker by email
    const user = await jobSeekerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Jobseeker not found." });
    }

    switch (type.toLowerCase()) {
      case "github":
        user.githubUrl = "";
        break;
      case "linkedin":
        user.linkedinUrl = "";
        break;
      case "phone":
        user.phone = "";
        break;
      case "dob":
        user.dateOfBirth = "";
        break;
      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: github, linkedin, phone, dob." });
    }

    await user.save();

    // Map type to a proper detail name for dynamic messaging.
    const detailNames = {
      github: "GitHub URL",
      linkedin: "LinkedIn URL",
      phone: "Phone Number",
      dob: "Date of Birth",
    };

    return res.status(200).json({ message: `${detailNames[type.toLowerCase()]} reset successfully.` , updatedUser: user});
  } catch (error) {
    console.error("Error resetting personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  changePassword,
  changeProfilePic,
  deleteProfilePic,
  getNameAndProfilePic,
  getJobSeekerPersonalDetails,
  updateJobSeekerPersonalDetails,
  resetJobSeekerPersonalDetails,
};
