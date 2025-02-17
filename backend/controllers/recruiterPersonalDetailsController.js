const Recruiter = require('../models/recruiterModel');

// GET function: Retrieve recruiter personal details
const getRecruiterPersonalDetails = async (req, res) => {
  try {
    const { email, type } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!type) {
      return res.status(400).json({ message: "Type parameter is required." });
    }
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found." });
    }
    switch (type.toLowerCase()) {
      case "dob":
        return res.status(200).json({ dob: recruiter.dateOfBirth });
      case "companywebsite":
        return res.status(200).json({ companyWebsite: recruiter.companyWebsite });
      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: dob, companyWebsite." });
    }
  } catch (error) {
    console.error("Error fetching recruiter personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST function: Update recruiter personal details (dob and companyWebsite)
const updateRecruiterPersonalDetails = async (req, res) => {
  try {
    const { email, type, value } = req.body;
    if (!email || !type || value === undefined) {
      return res.status(400).json({ message: "Email, type, and value are required." });
    }
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found." });
    }
    switch (type.toLowerCase()) {
      case "dob":
        // Validate that the provided value is a valid date and not in the future.
        const parsedDate = Date.parse(value);
        if (isNaN(parsedDate)) {
          return res.status(400).json({ message: "Invalid date of birth." });
        }
        const dobDate = new Date(parsedDate);
        if (dobDate > new Date()) {
          return res.status(400).json({ message: "Date of birth cannot be in the future." });
        }
        // Save the Date object directly.
        recruiter.set("dateOfBirth", dobDate, { strict: false });
        break;
      case "companywebsite":
        // Validate that the company website is a valid URL (must start with https://)
        const urlRegex = /^https:\/\/[^\s$.?#].[^\s]*$/;
        if (!urlRegex.test(value.trim())) {
          return res.status(400).json({ message: "Invalid company website URL. It should start with https://." });
        }
        recruiter.companyWebsite = value.trim();
        break;
      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: dob, companyWebsite." });
    }
    await recruiter.save();
    let message = "";
    if (type.toLowerCase() === "dob") {
      message = "Date of birth updated successfully.";
    } else if (type.toLowerCase() === "companywebsite") {
      message = "Company website updated successfully.";
    }
    return res.status(200).json({ message });
  } catch (error) {
    console.error("Error updating recruiter personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST function: Reset recruiter personal details.
// For "dob", resets to null; for "companywebsite", resets to an empty string.
const resetRecruiterPersonalDetails = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required." });
    }
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found." });
    }
    switch (type.toLowerCase()) {
      case "dob":
        recruiter.dateOfBirth = null;
        break;
      case "companywebsite":
        recruiter.companyWebsite = "";
        break;
      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: dob, companyWebsite." });
    }
    await recruiter.save();
    let message = "";
    if (type.toLowerCase() === "dob") {
      message = "Date of birth reset successfully.";
    } else if (type.toLowerCase() === "companywebsite") {
      message = "Company website reset successfully.";
    }
    return res.status(200).json({ message });
  } catch (error) {
    console.error("Error resetting recruiter personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getRecruiterPersonalDetails,
  updateRecruiterPersonalDetails,
  resetRecruiterPersonalDetails,
};
