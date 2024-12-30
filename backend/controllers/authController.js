const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating secure tokens
const { sendVerificationCode, sendResetPasswordEmail, generateResetToken} = require('../utils/emailService');
const JobSeeker = require('../models/jobSeekerModel'); // Import JobSeeker model
const Recruiter = require('../models/recruiterModel'); // Import Recruiter model
require('dotenv').config();

// Helper Function: Get Schema Based on Role
const getSchemaByRole = (role) => {
    if (role === 'jobseeker') return JobSeeker;
    if (role === 'recruiter') return Recruiter;
    throw new Error('Invalid role specified.');
};


// Register JobSeeker
const registerJobSeeker = async (req, res) => {
    const { fullName, email, password, phone, githubUrl, linkedinUrl, cv, profilePic, dateOfBirth, pin } = req.body;

    try {
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        if (existingJobSeeker || existingRecruiter) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        if (!/^\d{6}$/.test(pin)) {
            return res.status(400).json({ message: 'PIN must be a 6-digit number.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const hashedPin = await bcrypt.hash(pin.toString(), 10);
        const verificationCode = crypto.randomInt(100000, 999999);

        const user = await JobSeeker.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'jobseeker',
            isVerified: false,
            verificationCode,
            verificationCodeSentAt: new Date(),
            phone,
            githubUrl,
            linkedinUrl,
            cv,
            profilePic,
            dateOfBirth,
            pin: hashedPin
        });

        await sendVerificationCode(user.email, user.fullName, verificationCode);
        res.status(201).json({ message: 'Registration successful. Verification code sent to email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

// Register Recruiter
const registerRecruiter = async (req, res) => {
    const { fullName, email, password, companyName, companySize, companyWebsite, dateOfBirth, pin } = req.body;

    try {
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        if (existingJobSeeker || existingRecruiter) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        if (!/^\d{6}$/.test(pin)) {
            return res.status(400).json({ message: 'PIN must be a 6-digit number.' });
        }
        

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = await bcrypt.hash(pin.toString(), 10);
        const verificationCode = crypto.randomInt(100000, 999999);

        const user = await Recruiter.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'recruiter',
            isVerified: false,
            verificationCode,
            verificationCodeSentAt: new Date(),
            companyName,
            companySize,
            companyWebsite,
            dateOfBirth,
            pin: hashedPin
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
        // Resolve schema by role (jobseeker or recruiter)
        const Schema = getSchemaByRole(role);
        const user = await Schema.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check password validity
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttemptsLeft--;

            // Lock account if no attempts remain
            if (user.loginAttemptsLeft <= 0) {
                
                return res.status(405).json({
                    message: 'Too many failed attempts. Your account is now blocked - Please enter your PIN in order to reset your login attempts.',
                });
            }

            await user.save();
            return res.status(401).json({ message: `Incorrect password. You have ${user.loginAttemptsLeft} attempts remaining.` });
        }

        // Check account verification
        if (!user.isVerified) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(403).json({ message: 'Please verify your email before logging in.', token });
        }

        // Reset login attempts after successful login
        user.loginAttemptsLeft = 7;
        user.resetLoginAttemptsToken = undefined; // Invalidate the token
        await user.save();

        // Generate JWT token for successful login
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error(`[Login] Error occurred: ${error.message}`);
        res.status(500).json({ message: 'Login failed. Please try again later.' });
    }
};

// Reset Login Attempts
const resetLoginAttempts = async (req, res) => {
    const { email, pin } = req.body; // Extract email and PIN from the request body
    console.log("email: " + email, "pin: " + pin);
    try {
        // Find the user (either job seeker or recruiter) based on email
        const jobSeeker = await JobSeeker.findOne({ email });
        const recruiter = await Recruiter.findOne({ email });

        const user = jobSeeker || recruiter;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify the PIN
        const isPinValid = await bcrypt.compare(pin, user.pin); // Assuming hashedPin is stored in the database
        if (!isPinValid) {
            return res.status(401).json({ message: 'Invalid PIN. Access denied.' });
        }

        // Reset login attempts and clear lock state
        user.loginAttemptsLeft = 7; // Reset to the default allowed attempts
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

        // Check if the verification code was sent recently
        const now = new Date();
        if (user.verificationCodeSentAt && now - user.verificationCodeSentAt < 60000) {
            return res.status(444).json({ message: 'You can only request a new verification code once every minute.' });
        }

        // Generate a new verification code and update the user
        const verificationCode = crypto.randomInt(100000, 999999);
        user.verificationCode = verificationCode;
        user.verificationCodeSentAt = now;
        await user.save();

        // Send the verification code via email
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

        const isPinMatch = await bcrypt.compare(forgot_password_PIN, user.pin);
        if (!isPinMatch) {
            return res.status(401).json({ message: 'Incorrect PIN.' });
        }

        const resetToken = generateResetToken();
        const tokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
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

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the current password.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
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
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        let user = await JobSeeker.findOne({ email });
        if (!user) {
            user = await Recruiter.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            _id: user._id || null,
            fullName: user.fullName || null,
            email: user.email || null,
            password: user.password || null,
            role: user.role || null,
            phone: user.phone || null,
            cv: user.cv || null,
            profilePic: user.profilePic || null,
            githubUrl: user.githubUrl || null,
            linkedinUrl: user.linkedinUrl || null,
            isVerified: user.isVerified || null,
            verificationCode: user.verificationCode || null,
            verificationCodeSentAt: user.verificationCodeSentAt || null,
            dateOfBirth: user.dateOfBirth || null,
            companyName: user.companyName || null,
            companySize: user.companySize|| null,
            companyWebsite: user.companyWebsite|| null,
            loginAttemptsLeft: user.loginAttemptsLeft || null,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details.' });
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
};
