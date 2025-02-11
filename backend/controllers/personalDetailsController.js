const bcrypt = require('bcryptjs');
// Import the two user models
const jobSeekerModel = require('../models/jobSeekerModel');
const recruiterModel = require('../models/recruiterModel');
/**
 * Controller to change a user's password.
 * Expects the following in the request body:
 * - oldPassword: the user's current password.
 * - newPassword: the new password the user wants to set.
 *
 * Assumes the user is authenticated via the protect middleware,
 * and that req.user contains the user's id.
 */
const changePassword = async (req, res) => {
  try {
    // Extract user info from req.user
    const { id } = req.user;
    
    // Extract passwords from request body
    const { oldPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required." });
    }
    
    // Retrieve the user from one of the two models
    let user = await jobSeekerModel.findById(id);
    if (!user) {
      user = await recruiterModel.findById(id);
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Verify the old password matches the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    // Check that the new password is not equal to the old password
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot equal the old password." });
    }
    
    // Validate the new password meets the required criteria:
    // Must include at least one uppercase letter, one lowercase letter,
    // one digit, and be at least 8 characters long.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "New password does not meet the required criteria: Password must include uppercase, lowercase, a number, and be at least 8 characters long."
      });
    }
    
    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
module.exports = {
  changePassword,
};