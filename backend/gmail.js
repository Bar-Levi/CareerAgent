// Import the nodemailer package
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Source Gmail account
        pass: process.env.EMAIL_PASSWORD,    // Source Gmail password
    },
});

// Define email options
const mailOptions = {
    from: process.env.EMAIL, // Sender's email address
    to: 'bar314levi@gmail.com',     // Recipient's email address
    subject: 'Test Email from Nodemailer',
    text: 'Hello! This is a test email sent using Nodemailer.',
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error occurred:', error);
    } else {
        console.log('Email sent successfully:', info.response);
    }
});