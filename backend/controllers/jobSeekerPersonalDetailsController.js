const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const jobSeekerModel = require('../models/jobSeekerModel');
const recruiterModel = require('../models/recruiterModel');
const jobListingModel = require('../models/jobListingModel');
const applicantModel = require('../models/applicantModel');
const conversationModel = require('../models/conversationModel');
const multer = require('multer');
const path = require('path');
const { checkAndInsertIn }  = require("../utils/checkAndInsertIn");
const defaultProfilePic = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
const defaultCompanyLogo = "https://res.cloudinary.com/careeragent/image/upload/v1742730089/defaultCompanyLogo_lb5fsj.png";
const { extractPublicId, deleteFromCloudinary } = require('../utils/cloudinaryUtils');

/**
 * Controller to change a user's password.
 */
const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Email, old password and new password are required." });
    }
    
    // Decrypt the encrypted passwords from the client using the secret key
    const decryptedOldPassword = CryptoJS.AES.decrypt(oldPassword, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const decryptedNewPassword = CryptoJS.AES.decrypt(newPassword, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

    let user = await jobSeekerModel.findOne({ email });
    if (!user) {
      user = await recruiterModel.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    const isMatch = await bcrypt.compare(decryptedOldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    if (decryptedOldPassword === decryptedNewPassword) {
      return res.status(400).json({ message: "New password cannot equal the old password." });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(decryptedNewPassword)) {
      return res.status(400).json({
        message: "New password does not meet the required criteria: Password must include uppercase, lowercase, a number, and be at least 8 characters long."
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(decryptedNewPassword, salt);
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


/**
 * Single endpoint to handle both:
 * 1. POST /api/personal/change-pic  (for uploading new profile/company pic)
 *    - expects FormData: { file, email, picType } 
 * 2. DELETE /api/personal/change-pic (for deleting a current pic)
 *    - expects query params: ?email=<userEmail>&picType=<profile|company>
 */
const changePic = async (req, res) => {
  try {
    // For both POST + DELETE, we need email + picType
    const method = req.method; // POST or DELETE
    const email = method === "POST" ? req.body.email : req.query.email;
    const picType = method === "POST" ? req.body.picType : req.query.picType;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!picType) {
      return res
        .status(400)
        .json({ message: "picType (profile or company) is required." });
    }

    // Find user in either jobSeeker or recruiter collections
    let user = await jobSeekerModel.findOne({ email });
    if (!user) {
      user = await recruiterModel.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // DELETE method: Remove the image and update job listings accordingly
    if (method === "DELETE") {
      let currentUrl;
      if (picType === "company") {
        currentUrl = user.companyLogo;
        user.companyLogo = defaultCompanyLogo;
      } else {
        // "profile"
        currentUrl = user.profilePic;
        user.profilePic = defaultProfilePic;
        
        // If user is a jobSeeker, update all their application entries
        if (user.role === "JobSeeker") {
          await applicantModel.updateMany(
            { jobSeekerId: user._id },
            { profilePic: defaultProfilePic }
          );
          
          // Update profile pic in conversations
          await conversationModel.updateMany(
            { "participants.userId": user._id, "participants.role": "JobSeeker" },
            { "participants.$.profilePic": defaultProfilePic }
          );
        } else if (user.role === "Recruiter") {
          // Update profile pic in conversations for recruiters too
          await conversationModel.updateMany(
            { "participants.userId": user._id, "participants.role": "Recruiter" },
            { "participants.$.profilePic": defaultProfilePic }
          );
        }
      }

      // If there's an existing image that isn't default, remove from Cloudinary
      const isDefault =
        !currentUrl ||
        currentUrl === defaultCompanyLogo ||
        currentUrl === defaultProfilePic;
      if (!isDefault) {
        const publicId = extractPublicId(currentUrl);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            console.error("Failed to delete old image from Cloudinary:", err);
          }
        }
      }

      // Update job listings if the user is a Recruiter
      if (user.role === "Recruiter") {
        if (picType === "company") {
          await jobListingModel.updateMany(
            { recruiterId: user._id },
            { companyLogo: defaultCompanyLogo }
          );
        } else {
          await jobListingModel.updateMany(
            { recruiterId: user._id },
            { recruiterProfileImage: defaultProfilePic }
          );
        }
      }

      await user.save();
      return res.status(200).json({
        message: `${picType} picture deleted successfully.`,
        profilePic: user.profilePic,
        companyLogo: user.companyLogo,
      });
    }

    // POST method: Handle file upload
    if (method === "POST") {
      // Confirm a file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // Remove old image from Cloudinary if it's not default
      let oldImage;
      if (picType === "company") {
        oldImage = user.companyLogo;
      } else {
        oldImage = user.profilePic;
      }
      const isDefault =
        !oldImage ||
        oldImage === defaultCompanyLogo ||
        oldImage === defaultProfilePic;
      if (!isDefault) {
        const publicId = extractPublicId(oldImage);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            console.error("Failed to delete old image from Cloudinary:", err);
          }
        }
      }

      // Upload the new file to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: picType === "company" ? "companyLogos" : "profile_pictures" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message: "Failed to upload file." });
          }

          // Update the correct field and update job listings if needed
          if (picType === "company") {
            user.companyLogo = result.secure_url;
            if (user.role === "Recruiter") {
              await jobListingModel.updateMany(
                { recruiterId: user._id },
                { companyLogo: result.secure_url }
              );
            }
          } else {
            user.profilePic = result.secure_url;
            
            // If user is a jobSeeker, update all their application entries
            if (user.role === "JobSeeker") {
              await applicantModel.updateMany(
                { jobSeekerId: user._id },
                { profilePic: result.secure_url }
              );
              
              // Update profile pic in conversations
              await conversationModel.updateMany(
                { "participants.userId": user._id, "participants.role": "JobSeeker" },
                { "participants.$.profilePic": result.secure_url }
              );
            } else if (user.role === "Recruiter") {
              await jobListingModel.updateMany(
                { recruiterId: user._id },
                { recruiterProfileImage: result.secure_url }
              );
              
              // Update profile pic in conversations for recruiters too
              await conversationModel.updateMany(
                { "participants.userId": user._id, "participants.role": "Recruiter" },
                { "participants.$.profilePic": result.secure_url }
              );
            }
          }
          await user.save();

          // Return the updated URLs so the front-end can update state
          return res.status(200).json({
            message: `${picType} picture updated successfully.`,
            profilePic: user.profilePic,
            companyLogo: user.companyLogo,
          });
        }
      );
      // Pipe the file data from memory to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    }
  } catch (error) {
    console.error("Error in changePic:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


/**
 * Controller to get the current profile picture URL and name for the user.
 */
const getNameAndProfilePic = async (req, res) => {
  try {
    console.log("getNameAndProfilePic");
    const { email, id } = req.query;
    let user = null;
    if (email) {
      user =
        (await jobSeekerModel.findOne({ email })) ||
        (await recruiterModel.findOne({ email }));
    } else if (id) {
      user =
        (await jobSeekerModel.findOne({ _id: id })) ||
        (await recruiterModel.findOne({ _id: id }));
    } else {
      return res.status(400).json({ message: "Email or ID is required to fetch profile picture." });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log("DATA -", { profilePic: user.profilePic, name: user.fullName });
    return res.status(200).json({ profilePic: user.profilePic, name: user.fullName });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to update a jobseeker's personal detail.
 */
const updateJobSeekerPersonalDetails = async (req, res) => {
  try {
    const { email, type, value } = req.body;
    if (!email || !type || value === undefined) {
      return res.status(400).json({ message: "Email, type, and value are required." });
    }
    const user = await jobSeekerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Jobseeker not found." });
    }
    switch (type.toLowerCase()) {
      case "github":
        if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+$/.test(value.trim())) {
          return res.status(400).json({ message: "Invalid GitHub URL." });
        }
        user.githubUrl = value.trim();
        break;
      case "linkedin":
        if (!/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/.test(value.trim())) {
          return res.status(400).json({ message: "Invalid LinkedIn URL." });
        }
        user.linkedinUrl = value.trim();
        break;
      case "phone":
        if (!/^\+?[0-9]{7,15}$/.test(value.trim())) {
          return res.status(400).json({ message: "Invalid phone number." });
        }
        user.phone = value.trim();
        break;
      case "dob":
        const parsedDate = Date.parse(value);
        if (isNaN(parsedDate)) {
          return res.status(400).json({ message: "Invalid date of birth." });
        }
        const dobDate = new Date(parsedDate);
        if (dobDate > new Date()) {
          return res.status(400).json({ message: "Date of birth cannot be in the future." });
        }
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
    return res.status(200).json({ message: "Personal detail updated successfully.", updatedUser: user });
  } catch (error) {
    console.error("Error updating personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Controller to reset a jobseeker's personal detail.
 */
const resetJobSeekerPersonalDetails = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required." });
    }
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
    const detailNames = {
      github: "GitHub URL",
      linkedin: "LinkedIn URL",
      phone: "Phone Number",
      dob: "Date of Birth",
    };
    return res.status(200).json({ message: `${detailNames[type.toLowerCase()]} reset successfully.`, updatedUser: user });
  } catch (error) {
    console.error("Error resetting personal details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/* -----------------------------------------------------------------------------------------------
  CV Endpoints (update CV with analyzed_cv_content, delete CV with analyzed_cv_content)
------------------------------------------------------------------------------------------------ */

// Set up multer for CV upload using memory storage so we can stream the file
const cvStorage = multer.memoryStorage();
const cvFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};
const uploadCV = multer({ storage: cvStorage, fileFilter: cvFileFilter });

const getRelevancePoints = async (req, res) => {
  const { email } = req.query;
  try {
    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    res.status(200).json({ relevancePoints: jobSeeker.relevancePoints || {} });
  } catch (error) {
    console.error("Error fetching relevance points:", error);
    res.status(500).json({ message: "Failed to get relevance points" });
  }
};

const setRelevancePoints = async (req, res) => {
  const { email, relevancePoints } = req.body;
  try {
    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    jobSeeker.relevancePoints = relevancePoints;
    await jobSeeker.save();
    res.status(200).json({ message: "Relevance points updated successfully." });
  } catch (error) {
    console.error("Error updating relevance points:", error);
    res.status(500).json({ message: "Failed to update relevance points" });
  }
};

const getMinPointsForUpdate = async (req, res) => {
  const { email } = req.query;
  try {
    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    res.status(200).json({ minPointsForUpdate: jobSeeker.minPointsForUpdate || 0 });
  } catch (error) {
    console.error("Error fetching minimum points for update:", error);
    res.status(500).json({ message: "Failed to get minimum points for update" });
  }
};

const setMinPointsForUpdate = async (req, res) => {
  const { email, minPointsForUpdate } = req.body;
  try {
    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    jobSeeker.minPointsForUpdate = parseInt(minPointsForUpdate);
    await jobSeeker.save();
    res.status(200).json({ message: "Minimum points for update updated successfully." });
  } catch (error) {
    console.error("Error updating minimum points for update:", error);
    res.status(500).json({ message: "Failed to update minimum points for update" });
  }
};

// Updates the jobseeker's CV by first deleting the old CV (if exists) from Cloudinary,
// then uploading the new PDF to Cloudinary and updating analyzed_cv_content.
const updateCV = async (req, res) => {
  const { email } = req.query;
  try {
    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    
    // If a CV already exists, delete it from Cloudinary
    if (jobSeeker.cv) {
      const publicId = extractPublicId(jobSeeker.cv);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Upload the new CV using a stream.
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "cvs", resource_type: "auto" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Failed to upload CV." });
        }
        let cvUrl = result.secure_url;
        // If the URL contains '/raw/upload/', replace it with '/image/upload/'
        if (cvUrl.includes("/raw/upload/")) {
          cvUrl = cvUrl.replace("/raw/upload/", "/image/upload/");
        }
        jobSeeker.cv = cvUrl;
        // Update analyzed_cv_content using the value sent in req.body (expects a JSON string)
        if (req.body.analyzed_cv_content) {
          try {
            jobSeeker.analyzed_cv_content = JSON.parse(req.body.analyzed_cv_content);
            jobSeeker.analyzed_cv_content.education.forEach((edu) => {
            if(edu.degree) edu.degree = checkAndInsertIn(edu.degree);
            });
          } catch (err) {
            console.error("Error parsing analyzed_cv_content:", err);
          }
        }
        
        await jobSeeker.save();
        return res.status(200).json({ message: "CV updated successfully", cv: jobSeeker.cv });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Error updating CV:", error);
    res.status(500).json({ message: "Failed to update CV" });
  }
};


const deleteCV = async (req, res) => {
  const { email } = req.query;
  try {
    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) return res.status(404).json({ message: "Job seeker not found" });
    if (!jobSeeker.cv) return res.status(400).json({ message: "No CV to delete." });
    const publicId = extractPublicId(jobSeeker.cv);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
    // Remove the cv and analyzed_cv_content fields using $unset
    await jobSeekerModel.updateOne({ email }, { $unset: { cv: 1, analyzed_cv_content: 1 } });
    return res.status(200).json({ message: "CV deleted successfully." });
  } catch (error) {
    console.error("Error deleting CV:", error);
    res.status(500).json({ message: "Failed to delete CV" });
  }
};

const subscribeOrUnsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find the user in JobSeeker or Recruiter model
    let user = await jobSeekerModel.findOne({ email });
    if (!user) {
      user = await recruiterModel.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Toggle the isSubscribed field
    user.isSubscribed = !user.isSubscribed;
    await user.save();

    // Prepare an appropriate message based on new subscription status
    const statusMessage = user.isSubscribed
      ? "Successfully subscribed to notifications."
      : "Successfully unsubscribed from notifications.";

    res.status(200).json({ message: statusMessage });
  } catch (error) {
    console.error("Error in subscribeOrUnsubscribe controller:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getJobSeekerStatistics = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const jobSeeker = await jobSeekerModel.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found." });
    }

    const statistics = {
      numOfApplicationsSent: jobSeeker.numOfApplicationsSent || 0,
      numOfInterviewsScheduled: jobSeeker.numOfInterviewsScheduled || 0,
      numOfReviewedApplications: jobSeeker.numOfReviewedApplications || 0
    };

    // Calculate interview success rate
    const interviewSuccessRate = statistics.numOfReviewedApplications > 0 
      ? (statistics.numOfInterviewsScheduled / statistics.numOfReviewedApplications) * 100 
      : 0;

    statistics.interviewSuccessRate = interviewSuccessRate;

    res.status(200).json(statistics);
  } catch (error) {
    console.error("Error fetching job seeker statistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

module.exports = {
  changePassword,
  changePic,
  getNameAndProfilePic,
  getRelevancePoints,
  setRelevancePoints,
  getMinPointsForUpdate,
  setMinPointsForUpdate,
  updateJobSeekerPersonalDetails,
  resetJobSeekerPersonalDetails,
  updateCV,
  deleteCV,
  uploadCVMiddleware: uploadCV.single("cv"),
  subscribeOrUnsubscribe,
  getJobSeekerStatistics,
};
