const Recruiter = require('../models/recruiterModel');

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
        // Save the Date object directly into the recruiter document.
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
        
      case "companysize":
        // Validate that company size is a positive number
        const size = parseInt(value);
        if (isNaN(size) || size < 1) {
          return res.status(400).json({ message: "Company size must be a positive number." });
        }
        // Ensure the value is a valid integer without any non-numeric characters
        if (!(/^\d+$/.test(value))) {
          return res.status(400).json({ message: "Company size must be a whole number with no text or special characters." });
        }
        recruiter.companySize = size.toString();
        break;

      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: dob, companyWebsite, companySize." });
    }

    // Save changes to the database.
    await recruiter.save();

    // Prepare a success message.
    let message = "";
    if (type.toLowerCase() === "dob") {
      message = "Date of birth updated successfully.";
    } else if (type.toLowerCase() === "companywebsite") {
      message = "Company website updated successfully.";
    } else if (type.toLowerCase() === "companysize") {
      message = "Company size updated successfully.";
    }

    // Return the success message along with the updated recruiter details.
    return res.status(200).json({ message, updatedUser: recruiter });
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
      case "companysize":
        // For company size, set to a default value of "1" since it's required
        recruiter.companySize = "1";
        break;
      default:
        return res.status(400).json({ message: "Invalid detail type. Valid types: dob, companyWebsite, companySize." });
    }
    await recruiter.save();
    let message = "";
    if (type.toLowerCase() === "dob") {
      message = "Date of birth reset successfully.";
    } else if (type.toLowerCase() === "companywebsite") {
      message = "Company website reset successfully.";
    } else if (type.toLowerCase() === "companysize") {
      message = "Company size reset to default (1).";
    }
    // Return the success message along with the updated recruiter document.
    return res.status(200).json({ message, updatedUser: recruiter });
  } catch (error) {
    console.error("Error resetting recruiter personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  updateRecruiterPersonalDetails,
  resetRecruiterPersonalDetails,
};
