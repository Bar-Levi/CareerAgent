const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedTokenModel');
const crypto = require('crypto');
const { sendVerificationCode, sendResetPasswordEmail, generateResetToken, sendJobNotificationEmail } = require('../utils/emailService');
const JobSeeker = require('../models/jobSeekerModel');
const Recruiter = require('../models/recruiterModel');
const CryptoJS = require("crypto-js");
const { checkAndInsertIn }  = require("../utils/checkAndInsertIn");
const cloudinary = require('cloudinary');
const JobListing = require('../models/jobListingModel');
const Applicant = require('../models/applicantModel');
const Interview = require('../models/interviewModel');
const Conversation = require('../models/conversationModel');
const BotConversation = require('../models/botConversationModel');
const { extractPublicId, deleteFromCloudinary } = require('../utils/cloudinaryUtils');
require('dotenv').config();

// Helper Function: Get Schema Based on Role
const getSchemaByRole = (role) => {
    if (role === 'JobSeeker') return JobSeeker;
    if (role === 'Recruiter') return Recruiter;
    throw new Error('Invalid role specified.');
};

const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
};

// Register JobSeeker
const registerJobSeeker = async (req, res) => {
    const { 
        fullName,
        email,
        password,
        phone,
        githubUrl,
        linkedinUrl,
        cv,
        profilePic,
        dateOfBirth,
        pin,
        analyzed_cv_content
     } = req.body;

    try {
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        if (existingJobSeeker || existingRecruiter) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Decrypt the password and PIN
        const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        const decryptedPin = CryptoJS.AES.decrypt(pin, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

        if (!/^\d{6}$/.test(decryptedPin)) {
            return res.status(400).json({ message: 'PIN must be a 6-digit number.' });
        }

        if (getPasswordStrength(decryptedPassword) < 4) {
            return res.status(400).json({ message: 'Nice try, we gothca! ;)' });
        }

        const hashedPassword = await bcrypt.hash(decryptedPassword, 10);
        const hashedPin = await bcrypt.hash(decryptedPin, 10);
        const verificationCode = crypto.randomInt(100000, 999999);

        const userData = {
            fullName,
            email,
            password: hashedPassword,
            role: 'JobSeeker',
            isVerified: false,
            verificationCode,
            verificationCodeSentAt: new Date(),
            phone,
            githubUrl,
            linkedinUrl,
            dateOfBirth,
            pin: hashedPin,
        };
        
        if (cv) {
            userData.cv = cv;
            if (analyzed_cv_content) {
                if (analyzed_cv_content.education && Array.isArray(analyzed_cv_content.education)) {
                    analyzed_cv_content.education.forEach((edu) => {
                        if (edu.degree) {
                            edu.degree = checkAndInsertIn(edu.degree);
                        }
                    });
                }
                userData.analyzed_cv_content = analyzed_cv_content;
            }
            
            // Save the raw CV content if it's provided
            if (req.body.cvContent) {
                userData.cvContent = req.body.cvContent;
            }
        }

        if (profilePic)
            userData.profilePic = profilePic;
        
        const user = await JobSeeker.create(userData);
        
        await sendVerificationCode(user.email, user.fullName, verificationCode);
        res.status(201).json({ message: 'Registration successful. Verification code sent to email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

// Register Recruiter
const registerRecruiter = async (req, res) => {
    const { fullName, email, password, companyName, companySize, companyWebsite, dateOfBirth, pin, companyLogo, profilePic } = req.body;

    try {
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        if (existingJobSeeker || existingRecruiter) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Decrypt the password and PIN
        const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        const decryptedPin = CryptoJS.AES.decrypt(pin, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

        if (!/^\d{6}$/.test(decryptedPin)) {
            return res.status(400).json({ message: 'PIN must be a 6-digit number.' });
        }
        
        if (getPasswordStrength(decryptedPassword) < 4) {
            return res.status(400).json({ message: 'Nice try, we gothca! ;)' });
        }

        const hashedPassword = await bcrypt.hash(decryptedPassword, 10);
        const hashedPin = await bcrypt.hash(decryptedPin, 10);
        const verificationCode = crypto.randomInt(100000, 999999);

        const user = await Recruiter.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'Recruiter',
            isVerified: false,
            verificationCode,
            verificationCodeSentAt: new Date(),
            companyName,
            companySize,
            companyWebsite,
            dateOfBirth,
            pin: hashedPin,
            companyLogo, 
            profilePic
        });

        await sendVerificationCode(user.email, user.fullName, verificationCode);
        res.status(201).json({ message: 'Registration successful. Verification code sent to email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

// Verify Code
const verifyCode = async (req, res) => {
    const { email, code, role } = req.body;

    try {
        const Schema = getSchemaByRole(role);
        const user = await Schema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account associated with this email.' });
        }

        if (user.verificationCodeSentAt && new Date() - user.verificationCodeSentAt > 60000) {
            user.verificationCode = null;
            await user.save();
            return res.status(400).json({ message: 'Verification code has expired. Request a new code.' });
        }

        if (user.verificationCode !== parseInt(code)) {
            return res.status(400).json({ message: 'Incorrect verification code.' });
        }

        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        res.status(200).json({ message: 'Account verified successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during verification.' });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const Schema = getSchemaByRole(role);
        const user = await Schema.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Decrypt the password
        const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        const isMatch = await bcrypt.compare(decryptedPassword, user.password);
        if (!isMatch) {
            user.loginAttemptsLeft--;

            if (user.loginAttemptsLeft <= 0) {
                return res.status(405).json({
                    message: 'Too many failed attempts. Your account is now blocked - Please enter your PIN in order to reset your login attempts.',
                });
            }

            await user.save();
            return res.status(401).json({ message: `Incorrect password. You have ${user.loginAttemptsLeft} attempts remaining.` });
        }

        if (!user.isVerified) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(403).json({ message: 'Please verify your email before logging in.', token, user});
        }

        user.loginAttemptsLeft = 7;
        user.resetLoginAttemptsToken = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login successful.', token, user});
    } catch (error) {
        console.error(`[Login] Error occurred: ${error.message}`);
        res.status(500).json({ message: 'Login failed. Please try again later.' });
    }
};

// Reset Login Attempts
const resetLoginAttempts = async (req, res) => {
    const { email, pin } = req.body;
    try {
        const jobSeeker = await JobSeeker.findOne({ email });
        const recruiter = await Recruiter.findOne({ email });
        const user = jobSeeker || recruiter;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const decryptedPin = CryptoJS.AES.decrypt(pin, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        const isPinValid = await bcrypt.compare(decryptedPin, user.pin);
        if (!isPinValid) {
            return res.status(401).json({ message: 'Invalid PIN. Access denied.' });
        }

        user.loginAttemptsLeft = 7;
        await user.save();

        res.status(200).json({ message: 'Login attempts have been reset successfully.' });
    } catch (error) {
        console.error('Error resetting login attempts:', error);
        res.status(500).json({ message: 'Failed to reset login attempts.' });
    }
};

// Resend Verification Code
const resendVerificationCode = async (req, res) => {
    const { email, role } = req.body;

    try {
        const Schema = getSchemaByRole(role);
        const user = await Schema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const now = new Date();
        if (user.verificationCodeSentAt && now - user.verificationCodeSentAt < 60000) {
            return res.status(444).json({ message: 'You can only request a new verification code once every minute.' });
        }

        const verificationCode = crypto.randomInt(100000, 999999);
        user.verificationCode = verificationCode;
        user.verificationCodeSentAt = now;
        await user.save();

        await sendVerificationCode(user.email, user.fullName, verificationCode);

        res.status(200).json({ message: 'Verification code resent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to resend verification code.' });
    }
};

// Request Password Reset
const requestPasswordReset = async (req, res) => {
  const { forgot_password_email, forgot_password_PIN } = req.body;

  try {
    const jobSeeker = await JobSeeker.findOne({ email: forgot_password_email });
    const recruiter = await Recruiter.findOne({ email: forgot_password_email });
    const user = jobSeeker || recruiter;
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email.' });
    }

    const decryptedPin = CryptoJS.AES.decrypt(forgot_password_PIN, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const isPinMatch = await bcrypt.compare(decryptedPin, user.pin);
    if (!isPinMatch) {
      return res.status(401).json({ message: 'Incorrect PIN.' });
    }
    const resetToken = generateResetToken();
    const tokenExpiry = Date.now() + 3600000;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiry;
    
    // Fix for role validation: correct for both Recruiter and JobSeeker
    if (user.role === "Recruiter") {
      user.role = "Recruiter";
    } else if (user.role === "JobSeeker") {
      user.role = "JobSeeker";
    }
    
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(user.email, user.fullName, resetUrl, resetToken);

    res.status(200).json({ 
      message: "Password reset instructions sent to email. Please check your spam folder if the mail didn't arrive in your inbox."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process password reset request.' });
  }
};

module.exports = requestPasswordReset;

// Reset Password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const jobSeeker = await JobSeeker.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        const recruiter = await Recruiter.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        const user = jobSeeker || recruiter;

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const decryptedNewPassword = CryptoJS.AES.decrypt(newPassword, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        const isSamePassword = await bcrypt.compare(decryptedNewPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the current password.' });
        }

        user.password = await bcrypt.hash(decryptedNewPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been successfully reset.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
};

// Get User Details
const getUserDetails = async (req, res) => {
    try {
      const { email, id } = req.query;

      if (!email && !id) {
        return res.status(400).json({ message: "Email or ID is required." });
      }
  
      let user = null;
  
      if (email) {
        user = await JobSeeker.findOne({ email });
        if (!user) {
          user = await Recruiter.findOne({ email });
        }
      } else if (id) {
        user = await JobSeeker.findById(id);
        if (!user) {
          user = await Recruiter.findById(id);
        }
      }
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      const userObj = user.toObject();
  
      if (user.constructor.modelName === "JobSeeker") {
        userObj.jobSeekerId = user._id;
      } else if (user.constructor.modelName === "Recruiter") {
        userObj.recruiterId = user._id;
      }
  
      res.status(200).json(userObj);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details." });
    }
};
  
const uploadCV = async (req, res) => {
    try {
      const { id } = req.params;
      const cvPath = req.body.cv;
      const analyzed_cv_content = JSON.parse(req.body.analyzed_cv_content);
  
      const user = await JobSeeker.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      user.cv = cvPath;
      user.analyzed_cv_content = analyzed_cv_content;
      await user.save();
  
      res.status(200).json({ message: "CV uploaded successfully.", cv: cvPath, analyzed_cv_content });
    } catch (error) {
      console.error("Error uploading CV:", error);
      res.status(500).json({ message: "Failed to upload CV." });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
          return res.status(400).json({ error: 'Token not provided' });
        }
    
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
          return res.status(400).json({ error: 'Invalid token' });
        }
    
        const expiresAt = new Date(decoded.exp * 1000);
        await BlacklistedToken.create({ token, expiresAt });
    
        res.status(200).json({ message: 'Logged out successfully. Token blacklisted.' });
      } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'An error occurred during logout.' });
      }
};

const checkBlacklist = async (req, res) => {
    try {
      const { token } = req.body;
  
      if (!token) {
        return res.status(400).json({ error: 'Token not provided' });
      }
  
      const blacklistedToken = await BlacklistedToken.findOne({ token });
      if (blacklistedToken) {
        return res.status(200).json({ isBlacklisted: true });
      }
  
      res.status(200).json({ isBlacklisted: false });
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
      const { userId, notificationId } = req.params;
  
      let user = await JobSeeker.findById(userId);
      if (!user) {
        user = await Recruiter.findById(userId);
      }
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.notifications = user.notifications.filter(
        (notification) => notification._id.toString() !== notificationId
      );
  
      await user.save();
  
      res.status(200).json({
        message: "Notification deleted successfully",
        notifications: user.notifications,
      });
    } catch (error) {
      console.error("Error deleting notification:", error.message);
      res.status(500).json({ message: error.message });
    }
};

const markAsReadNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    
    let user = await JobSeeker.findById(userId);
    if (!user) {
      user = await Recruiter.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = user.notifications.find(
      (notification) => notification._id.toString() === notificationId
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await user.save();
    res.status(200).json({
      message: "Notification marked as read successfully",
      notifications: user.notifications,
    });
  } catch (err) {
    console.error("Error marking notification as read:", err.message);
    res.status(500).json({ message: err.message });
  }
    



};

const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await JobSeeker.findById(userId);
    if (!user) {
      user = await Recruiter.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.notifications = [];
    await user.save();
    res.status(200).json({
      message: "All notifications deleted successfully.",
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const [jobSeeker, recruiter] = await Promise.all([
      JobSeeker.findOne({ email }),
      Recruiter.findOne({ email })
    ]);
    res.status(200).json({ exists: Boolean(jobSeeker || recruiter) });
  } catch (error) {
    res.status(500).json({ message: 'Server error while checking email.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') console.log('Starting delete user process...');
    const { userId, userType } = req.params;
    if (process.env.NODE_ENV !== 'production') console.log(`Deleting ${userType} with ID: ${userId}`);
    
    const Schema = getSchemaByRole(userType);
    if (process.env.NODE_ENV !== 'production') console.log(`Using schema: ${Schema.modelName}`);
    
    const user = await Schema.findById(userId);
    if (process.env.NODE_ENV !== 'production') console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      if (process.env.NODE_ENV !== 'production') console.log('User not found, returning 404');
      return res.status(404).json({ message: 'User not found.' });
    }

    if (process.env.NODE_ENV !== 'production') console.log('Checking profile picture...');
    // Delete profile picture from Cloudinary if not default
    const defaultProfilePic = 'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png';
    if (user.profilePic && user.profilePic !== defaultProfilePic) {
      if (process.env.NODE_ENV !== 'production') console.log('Non-default profile pic found:', user.profilePic);
      const profilePicPublicId = extractPublicId(user.profilePic);
      if (process.env.NODE_ENV !== 'production') console.log('Profile pic public ID:', profilePicPublicId);
      if (profilePicPublicId) {
        if (process.env.NODE_ENV !== 'production') console.log('Attempting to delete profile pic from Cloudinary...');
        try {
          await deleteFromCloudinary(profilePicPublicId);
          if (process.env.NODE_ENV !== 'production') console.log('Profile pic deleted successfully');
        } catch (cloudinaryError) {
          if (process.env.NODE_ENV !== 'production') console.error('Error deleting profile pic from Cloudinary:', cloudinaryError);
        }
      }
    }

    // For recruiters, delete company logo and job listings
    if (userType === 'Recruiter') {
      if (process.env.NODE_ENV !== 'production') console.log('Processing Recruiter-specific deletions...');
      const defaultCompanyLogo = 'https://res.cloudinary.com/careeragent/image/upload/v1742730089/defaultCompanyLogo_lb5fsj.png';
      if (user.companyLogo && user.companyLogo !== defaultCompanyLogo) {
        if (process.env.NODE_ENV !== 'production') console.log('Non-default company logo found:', user.companyLogo);
        const companyLogoPublicId = extractPublicId(user.companyLogo);
        if (process.env.NODE_ENV !== 'production') console.log('Company logo public ID:', companyLogoPublicId);
        if (companyLogoPublicId) {
          if (process.env.NODE_ENV !== 'production') console.log('Attempting to delete company logo from Cloudinary...');
          try {
            await deleteFromCloudinary(companyLogoPublicId);
            if (process.env.NODE_ENV !== 'production') console.log('Company logo deleted successfully');
          } catch (cloudinaryError) {
            if (process.env.NODE_ENV !== 'production') console.error('Error deleting company logo from Cloudinary:', cloudinaryError);
          }
        }
      }

      // Find all job listings with applicants before deleting them
      if (process.env.NODE_ENV !== 'production') console.log('Finding job listings for recruiter...');
      const jobListings = await JobListing.find({ recruiterId: userId });
      if (process.env.NODE_ENV !== 'production') console.log(`Found ${jobListings.length} job listings`);
      
      // Notify all job seekers who applied to any of the recruiter's job listings
      if (process.env.NODE_ENV !== 'production') console.log('Processing notifications for applicants...');
      const notifiedJobSeekers = new Set(); // To avoid duplicate notifications
      
      for (const jobListing of jobListings) {
        if (process.env.NODE_ENV !== 'production') console.log(`Processing job listing: ${jobListing._id}, applicants: ${jobListing.applicants?.length || 0}`);
        if (jobListing.applicants && jobListing.applicants.length > 0) {
          for (const applicant of jobListing.applicants) {
            if (process.env.NODE_ENV !== 'production') console.log(`Processing applicant: ${applicant.jobSeekerId}`);
            if (!notifiedJobSeekers.has(applicant.jobSeekerId.toString())) {
              if (process.env.NODE_ENV !== 'production') console.log(`Finding JobSeeker: ${applicant.jobSeekerId}`);
              const jobSeeker = await JobSeeker.findById(applicant.jobSeekerId);
              if (process.env.NODE_ENV !== 'production') console.log('JobSeeker found:', jobSeeker ? 'Yes' : 'No');
              if (jobSeeker) {
                if (process.env.NODE_ENV !== 'production') console.log(`Sending notification email to: ${jobSeeker.email}`);
                try {
                  await sendJobNotificationEmail(
                    jobSeeker.email,
                    {
                      jobRole: jobListing.jobRole,
                      company: jobListing.company,
                      location: jobListing.location
                    },
                    "jobListingDeleted"
                  );
                  if (process.env.NODE_ENV !== 'production') console.log('Notification email sent successfully');
                  notifiedJobSeekers.add(applicant.jobSeekerId.toString());
                } catch (emailError) {
                  if (process.env.NODE_ENV !== 'production') console.error('Error sending notification email:', emailError);
                }
              }
            }
          }
        }
      }

      // Delete all job listings posted by this recruiter
      if (process.env.NODE_ENV !== 'production') console.log('Deleting all job listings for recruiter...');
      try {
        const result = await JobListing.deleteMany({ recruiterId: userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${result.deletedCount} job listings`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting job listings:', deleteError);
      }
    }

    // Delete user from applicants array in JobListing model
    if (userType === 'JobSeeker') {
      if (process.env.NODE_ENV !== 'production') console.log('Processing JobSeeker-specific deletions...');
      // Delete CV from Cloudinary if it exists
      if (user.cv) {
        if (process.env.NODE_ENV !== 'production') console.log('CV found:', user.cv);
        // CV deletion logic remains unchanged
        const cvPublicId = (() => {
          const parts = user.cv.split('/upload/');
          if (parts.length < 2) return null;
          const withoutVersion = parts[1].replace(/^v\d+\//, '');
          return withoutVersion.split('.')[0];
        })();
        if (process.env.NODE_ENV !== 'production') console.log('CV public ID:', cvPublicId);
        if (cvPublicId) {
          if (process.env.NODE_ENV !== 'production') console.log('Attempting to delete CV from Cloudinary...');
          try {
            await cloudinary.uploader.destroy(cvPublicId, { resource_type: 'raw' });
            if (process.env.NODE_ENV !== 'production') console.log('CV deleted successfully');
          } catch (cloudinaryError) {
            if (process.env.NODE_ENV !== 'production') console.error('Error deleting CV from Cloudinary:', cloudinaryError);
          }
        }
      }

      // Find all job listings where this job seeker is an applicant
      if (process.env.NODE_ENV !== 'production') console.log('Finding job listings where user is an applicant...');
      const jobListings = await JobListing.find({ 'applicants.jobSeekerId': userId });
      if (process.env.NODE_ENV !== 'production') console.log(`Found ${jobListings.length} job listings with user as applicant`);
      
      // For each job listing, remove the job seeker from applicants array
      for (const jobListing of jobListings) {
        if (process.env.NODE_ENV !== 'production') console.log(`Processing job listing: ${jobListing._id}`);
        const originalLength = jobListing.applicants.length;
        jobListing.applicants = jobListing.applicants.filter(
          applicant => applicant.jobSeekerId.toString() !== userId
        );
        if (process.env.NODE_ENV !== 'production') console.log(`Removed ${originalLength - jobListing.applicants.length} applicant entries`);
        try {
          await jobListing.save();
          if (process.env.NODE_ENV !== 'production') console.log('Job listing updated successfully');
        } catch (saveError) {
          if (process.env.NODE_ENV !== 'production') console.error('Error saving job listing:', saveError);
        }
      }

      // Delete entries from ApplicantModel
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from Applicant model...');
      try {
        const applicantResult = await Applicant.deleteMany({ jobSeekerId: userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${applicantResult.deletedCount} applicant records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from Applicant model:', deleteError);
      }

      // Delete entries from InterviewModel
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from Interview model...');
      try {
        const interviewResult = await Interview.deleteMany({ 'participants.0.userId': userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${interviewResult.deletedCount} interview records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from Interview model:', deleteError);
      }

      // Delete entries from ConversationModel
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from Conversation model...');
      try {
        const conversationResult = await Conversation.deleteMany({ 'participants.0.userId': userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${conversationResult.deletedCount} conversation records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from Conversation model:', deleteError);
      }

      // Delete entries from BotConversationModel
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from BotConversation model...');
      try {
        const botConvResult = await BotConversation.deleteMany({ email: user.email });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${botConvResult.deletedCount} bot conversation records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from BotConversation model:', deleteError);
      }
    } else {
      // For recruiters, do the same cleanup
      if (process.env.NODE_ENV !== 'production') console.log('Additional cleanup for Recruiter...');
      
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from Applicant model...');
      try {
        const applicantResult = await Applicant.deleteMany({ recruiterId: userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${applicantResult.deletedCount} applicant records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from Applicant model:', deleteError);
      }
      
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from Interview model...');
      try {
        const interviewResult = await Interview.deleteMany({ 'participants.1.userId': userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${interviewResult.deletedCount} interview records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from Interview model:', deleteError);
      }
      
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from Conversation model...');
      try {
        const conversationResult = await Conversation.deleteMany({ 'participants.1.userId': userId });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${conversationResult.deletedCount} conversation records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from Conversation model:', deleteError);
      }
      
      if (process.env.NODE_ENV !== 'production') console.log('Deleting from BotConversation model...');
      try {
        const botConvResult = await BotConversation.deleteMany({ email: user.email });
        if (process.env.NODE_ENV !== 'production') console.log(`Deleted ${botConvResult.deletedCount} bot conversation records`);
      } catch (deleteError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error deleting from BotConversation model:', deleteError);
      }
    }

    // Finally, delete the user
    if (process.env.NODE_ENV !== 'production') console.log('Deleting user document...');
    try {
      await Schema.findByIdAndDelete(userId);
      if (process.env.NODE_ENV !== 'production') console.log('User document deleted successfully');
    } catch (deleteError) {
      if (process.env.NODE_ENV !== 'production') console.error('Error deleting user document:', deleteError);
      throw deleteError; // Re-throw to be caught by the outer catch
    }

    if (process.env.NODE_ENV !== 'production') console.log('User deletion process completed successfully');
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error in deleteUser function:', error);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
};


module.exports = {
    registerRecruiter,
    registerJobSeeker,
    verifyCode,
    loginUser,
    resendVerificationCode,
    requestPasswordReset,
    resetPassword,
    getUserDetails,
    resetLoginAttempts,
    uploadCV,
    logout,
    checkBlacklist,
    deleteNotification,
    deleteAllNotifications,
    markAsReadNotification,
    checkEmail,
    deleteUser,
};
