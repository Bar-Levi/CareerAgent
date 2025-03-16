const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Mail Sender Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationCode = async (email, username, code) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your CareerAgent Account',
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Verify Your CareerAgent Account</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; color: #333; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>Thank you for signing up for CareerAgent. Use the verification code below to complete your registration:</p>
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
                    <p>This code will expire in 1 minute.</p>
                    <p>If you did not sign up for CareerAgent, please ignore this email.</p>
                    <p style="margin-top: 20px;">Best regards,</p>
                    <p><strong>The CareerAgent Team</strong></p>
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

// Send Password Reset Email
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

// Generate Reset Token
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

// Send a mail for job notification.
const sendJobNotificationEmail = async (email, jobListing) => {
    try {
        const mailOptions = {
            from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `New Relevant Job Listing: ${jobListing.jobRole} at ${jobListing.company}`,
            html: `
              <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">New Job Listing Alert!</h1>
                </div>
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                  <p>Hello,</p>
                  <p>A new job listing that might be relevant to you has been posted:</p>
                  <p><strong>Job Role:</strong> ${jobListing.jobRole}</p>
                  <p><strong>Company:</strong> ${jobListing.company}</p>
                  <p><strong>Location:</strong> ${jobListing.location}</p>
                  <p>Check it out on our platform and apply if you're interested!</p>
                  <p>Best regards,</p>
                  <p><strong>The CareerAgent Team</strong></p>
                  <p style="font-size: 12px; color: #777;">
                    If you wish to unsubscribe from these notifications, please 
                    <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #2c2c54; text-decoration: none;">click here</a>.
                  </p>
                </div>
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px;">
                  <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
              </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Job notification email sent to ${email}`);
    } catch(error) {
        console.error(`Error sending job notification email to ${email}:`, error);
    }
};

module.exports = {
    sendVerificationCode,
    sendResetPasswordEmail,
    generateResetToken,
    sendJobNotificationEmail
};
