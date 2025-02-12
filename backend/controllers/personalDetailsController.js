const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const jobSeekerModel = require('../models/jobSeekerModel');
const recruiterModel = require('../models/recruiterModel');

const defaultProfilePic = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";

/**
 * Controller to change a user's password.
 * Expects:
 * - oldPassword: the user's current password.
 * - newPassword: the new password the user wants to set.
 * 
 * Assumes req.user contains the user's id.
 */
const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required." });
    }
    let user = await jobSeekerModel.findById(id);
    if (!user) {
      user = await recruiterModel.findById(id);
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
 * Expects a file uploaded via multer (available in req.file).
 * Assumes req.user contains the user's id.
 */
const changeProfilePic = async (req, res) => {
  try {
    const { id } = req.user;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    let user = await jobSeekerModel.findById(id);
    if (!user) {
      user = await recruiterModel.findById(id);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_pictures" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Failed to upload file." });
        }
        user.profilePic = result.secure_url;
        await user.save();
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
 * Resets the profilePic field to the default URL.
 * Assumes req.user contains the user's id.
 */
const deleteProfilePic = async (req, res) => {
  try {
    const { id } = req.user;
    let user = await jobSeekerModel.findById(id);
    if (!user) {
      user = await recruiterModel.findById(id);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.profilePic = defaultProfilePic;
    await user.save();
    return res.status(200).json({ message: "Profile picture deleted successfully.", profilePic: defaultProfilePic });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to get the current profile picture URL for the logged in user.
 * Assumes req.user contains the user's id.
 */
const getProfilePic = async (req, res) => {
  try {
    const { id } = req.user;
    let user = await jobSeekerModel.findById(id);
    if (!user) {
      user = await recruiterModel.findById(id);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ profilePic: user.profilePic });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  changePassword,
  changeProfilePic,
  deleteProfilePic,
  getProfilePic,
};
