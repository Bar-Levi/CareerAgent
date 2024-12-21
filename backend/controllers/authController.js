const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For generating a secure code
require('dotenv').config();

// Mail Sender Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// Function to send the verification code
const sendVerificationCode = async (email, username, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
                <p>Dear ${username},</p>
                <p>Thank you for signing up with CareerAgent. To complete your registration, please verify your account by entering the verification code below:</p>
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
                <p>If you didn't sign up for CareerAgent, please ignore this email.</p>
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





// Register User Function
const registerUser = async (req, res) => {
    const { fullName, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
              // Generate a random 6-digit verification code
        const verificationCode = crypto.randomInt(100000, 999999);
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            isVerified: false,
            verificationCode, // Save the generated code to the DB
            verificationCodeSentAt: new Date(), // Save the timestamp when the code was sent
        });
        // Send the verification code
        await sendVerificationCode(user.email,user.fullName, verificationCode);
        
        res.status(201).json({ message: 'Registration successful. Verification code sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        // Case 1: User does not exist
        if (!user) {
            return res.status(404).json({ message: 'No account associated with this email.' });
        }

        // Case 2: Verification code has expired
        const now = new Date();
        if (user.verificationCodeSentAt && now - user.verificationCodeSentAt > 60 * 1000) {
            user.verificationCode = null; // Invalidate the code
            await user.save();
            return res.status(400).json({
                message: 'Verification code has expired. Please request a new code.',
            });
        }

        // Case 3: Incorrect verification code
        if (user.verificationCode !== parseInt(code)) {
            return res.status(400).json({ message: 'Incorrect verification code.' });
        }

        // Case 4: Verification successful
        user.isVerified = true;
        user.verificationCode = null; // Clear the code after successful verification
        await user.save();

        res.status(200).json({ message: 'Account verified successfully!' });
    } catch (error) {
        console.error('Error verifying code:', error.message);
        res.status(500).json({ message: 'An internal server error occurred. Please try again.' });
    }
};



// Login User Function
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if 1 minute has passed since the last code was sent
        const now = new Date();
        console.log("user.verificationCodeSentAt: ",user.verificationCodeSentAt)
        console.log("now - user.verificationCodeSentAt: ",now - user.verificationCodeSentAt)
        

        // Generate and save a new verification code
        const verificationCode = crypto.randomInt(100000, 999999);
        user.verificationCode = verificationCode;
        user.verificationCodeSentAt = new Date();
        await user.save();

        // Resend the verification code via email
        await sendVerificationCode(user.email,user.fullName, verificationCode);

        res.status(200).json({ message: 'Verification code resent successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { registerUser, verifyCode, loginUser, resendVerificationCode };
