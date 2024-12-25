const JobSeeker = require('../models/jobSeekerModel'); // Import JobSeeker model
const Recruiter = require('../models/recruiterModel'); // Import Recruiter model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const jobSeekerModel = require('../models/jobSeekerModel');
const recruiterModel = require('../models/recruiterModel');
const crypto = require('crypto'); // For generating secure tokens
require('dotenv').config();

// Mail Sender Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper Function: Send Verification Code Email
const sendVerificationCode = async (email, username, code) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Account - CareerAgent Team',
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Welcome to CareerAgent!</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; color: #333; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>Thank you for signing up with CareerAgent. To complete your registration, please use the verification code below:</p>
                    <!-- Code Box -->
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="
                            display: inline-block;
                            font-size: 24px;
                            font-weight: bold;
                            color: #2c2c54;
                            background-color: #f0f0f0;
                            border: 2px dashed #2c2c54;
                            padding: 10px 20px;
                            border-radius: 8px;
                        ">
                            ${code}
                        </span>
                    </div>
                    <p>If you didn’t sign up for CareerAgent, please ignore this email.</p>
                    <p style="margin-top: 20px;">Best regards,</p>
                    <p><strong>The CareerAgent Team</strong></p>
                    <p style="font-size: 14px; color: #555; margin-top: 20px;">
                        <em>This verification code will expire in 1 minute.</em>
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #555;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

// Helper Function: Generate Reset Token
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const checkEmailExists = async (req, res) => {
    const { email } = req.body; // Extract the email from the request body
    

    try {
        // Check for the email in both schemas
        const existingJobSeeker = await JobSeeker.findOne({ email });
        const existingRecruiter = await Recruiter.findOne({ email });

        // If email exists in either schema, return a response indicating so
        if (existingJobSeeker || existingRecruiter) {
            return res.status(409).json({ exists: true, message: 'Email is already registered.' });
        }

        // If not found in either schema, return a response indicating it doesn't exist
        res.status(200).json({ exists: false, message: 'Email is available for registration.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while checking the email.' });
    }
};

// Helper Function: Get Schema Based on Role
const getSchemaByRole = (role) => {
    if (role === 'jobseeker') return JobSeeker;
    if (role === 'recruiter') return Recruiter;
    throw new Error('Invalid role specified.');
};

// Register User
const registerJobSeeker = async (req, res) => {
    console.log("Registering JobSeeker")
    const { fullName, email, password, phone, githubUrl, linkedinUrl, cv, profilePic, dateOfBirth } = req.body;

    try {
        // Check if email exists in either schema
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
        // Check if email exists in either schema
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
const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const Schema = getSchemaByRole(role);

        const user = await Schema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Password.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10s' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.', token});
        }
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// Resend Verification Code
const resendVerificationCode = async (req, res) => {
    const { email, role } = req.body;
    console.log('\n\n\n\n\n\)');
    console.log(`Resending Verification Code for ${email} (${role})`);

    try {
        const Schema = getSchemaByRole(role);

        const user = await Schema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const verificationCode = crypto.randomInt(100000, 999999);
        user.verificationCode = verificationCode;
        user.verificationCodeSentAt = new Date();
        await user.save();

        await sendVerificationCode(user.email, user.fullName, verificationCode);
        res.status(200).json({ message: 'Verification code resent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to resend verification code.' });
    }
};

const sendResetPasswordEmail = async (email, username, resetUrl, resetToken) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - CareerAgent Team',
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; color: #333; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>We received a request to reset your password. Please follow the instructions below:</p>
                    <ol>
                        <li>
                            Copy this reset token:
                            <span style="
                                display: inline-block;
                                font-size: 18px;
                                font-weight: bold;
                                color: #2c2c54;
                                background-color: #f0f0f0;
                                border: 2px dashed #2c2c54;
                                padding: 5px 10px;
                                border-radius: 8px;
                                margin: 10px 0;
                                display: inline-block;
                            ">
                                ${resetToken}
                            </span>
                        </li>
                        <li>
                            Click the link below to reset your password:
                            <br />
                            <a href="${resetUrl}" target="_blank" style="color: #2c2c54; text-decoration: none; font-weight: bold;">Reset Password</a>
                        </li>
                        <li>Enter the reset token and your new password on the reset password page.</li>
                    </ol>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #555;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

// Request Password Reset
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        // Search in both schemas
        const jobSeeker = await JobSeeker.findOne({ email });
        const recruiter = await Recruiter.findOne({ email });

        const user = jobSeeker || recruiter;

        if (!user) {
            return res.status(404).json({ message: 'No user found with that email.' });
        }

        // Generate reset token and expiry
        const resetToken = generateResetToken();
        const tokenExpiry = Date.now() + 3600000; // 1 hour

        // Save the token and expiry
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Send the reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendResetPasswordEmail(user.email, user.fullName, resetUrl, resetToken);

        res.status(200).json({ message: "Password reset instructions sent to email.\nCheck your spam folder if the mail didn't arrive to your inbox." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process password reset request.' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Search in both schemas for a valid reset token
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

        // Ensure the new password is different
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                message: 'New password must be different from the current password.',
            });
        }

        // Hash and save the new password
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

const getUserDetails = async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        let user = await jobSeekerModel.findOne({ email });
        if (!user) {
            user = await recruiterModel.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            role: user.role,
            phone: user.phone,
            cv: user.cv || null,
            profilePic: user.profilePic || null,
            githubUrl: user.githubUrl,
            linkedinUrl: user.linkedinUrl,
            isVerified: user.isVerified,
            verificationCode: user.verificationCode,
            verificationCodeSentAt: user.verificationCodeSentAt,
            dateOfBirth: user.dateOfBirth
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details.' });
    }
}

module.exports = {
    checkEmailExists,
    registerRecruiter,
    registerJobSeeker,
    verifyCode,
    loginUser,
    resendVerificationCode,
    requestPasswordReset,
    resetPassword,
    getUserDetails
};
