const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating secure tokens
const { sendVerificationCode, sendResetPasswordEmail, generateResetToken, sendResetLoginAttemptsEmail  } = require('../utils/emailService');
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
    const { fullName, email, password, phone, githubUrl, linkedinUrl, cv, profilePic, dateOfBirth } = req.body;

    try {
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        if (existingJobSeeker || existingRecruiter) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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
    const { fullName, email, password, companyName, companySize, companyWebsite, dateOfBirth } = req.body;

    try {
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        if (existingJobSeeker || existingRecruiter) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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
const LOGIN_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Resolve schema by role (jobseeker or recruiter)
        const Schema = getSchemaByRole(role);
        const user = await Schema.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if account is currently locked
        if (new Date() < user.loginBlockExpiration) {
            // Generate a new reset token
            user.resetLoginAttemptsToken = crypto.randomBytes(32).toString('hex');
            const resetLink = `${process.env.FRONTEND_URL}/reset-login-attempts?token=${user.resetLoginAttemptsToken}`;
            await user.save();

            // Send reset email
            await sendResetLoginAttemptsEmail(user.email, user.fullName, resetLink);

            console.log(`[Login] Account locked. Reset email sent to ${user.email}`);
            return res.status(405).json({
                message: 'Your account is blocked. A new reset link has been sent to your email.',
            });
        }

        // Check password validity
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttemptsLeft--;

            // Lock account if no attempts remain
            if (user.loginAttemptsLeft <= 0) {
                user.loginBlockExpiration = new Date(Date.now() + LOGIN_BLOCK_DURATION); // Set lockout duration
                user.resetLoginAttemptsToken = crypto.randomBytes(32).toString('hex');
                const resetLink = `${process.env.FRONTEND_URL}/reset-login-attempts?token=${user.resetLoginAttemptsToken}`;

                await user.save();
                await sendResetLoginAttemptsEmail(user.email, user.fullName, resetLink);

                console.log(`[Login] Account locked after failed attempts. Reset email sent to ${user.email}`);
                return res.status(405).json({
                    message: 'Too many failed attempts. Your account is now blocked for 1 hour. Check your email for a reset link.',
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
        user.loginBlockExpiration = undefined; // Clear lock state
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
    const { token } = req.body;
    try {
        const jobSeeker = await JobSeeker.findOne({ resetLoginAttemptsToken: token });
        const recruiter = await Recruiter.findOne({ resetLoginAttemptsToken: token });

        const user = jobSeeker || recruiter;

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        user.loginAttemptsLeft = 7;
        user.resetLoginAttemptsToken = undefined; // Invalidate the token
        user.loginBlockExpiration = undefined; // Clear lock state
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
            return res.status(429).json({ message: 'You can only request a new verification code once every minute.' });
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
    const { email } = req.body;

    try {
        const jobSeeker = await JobSeeker.findOne({ email });
        const recruiter = await Recruiter.findOne({ email });

        const user = jobSeeker || recruiter;

        if (!user) {
            return res.status(404).json({ message: 'No user found with that email.' });
        }

        // Check if the account is blocked
        if (user.loginBlockExpiration && new Date() < user.loginBlockExpiration) {
            const retryTime = user.loginBlockExpiration.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return res.status(405).json({
                message: `Your account is blocked. You cannot reset your password until the block expires at ${retryTime}.`,
            });
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

// Get User Details
const getUserLoginAttempts = async (req, res) => {
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
    getUserLoginAttempts,
    resetLoginAttempts,
};
