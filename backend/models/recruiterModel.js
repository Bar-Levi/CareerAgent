const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        required: [true, 'Full name is required'],
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address',
        ],
        required: [true, 'Email is required'],
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['recruiter'],
        required: [true, 'Role is required'],
        default: 'recruiter',
    },
    profilePic: {
        type: String,
        required: false,
        default: 'https://res.cloudinary.com/demooji6w/image/upload/v1735084555/user_1_psxsus.png',
    },
    companyName: {
        type: String,
        trim: true,
        required: [true, 'Company name is required'],
    },
    companySize: {
        type: String,
        trim: true,
        required: [true, 'Company size is required'],
    },
    companyWebsite: {
        type: String,
        trim: true,
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: Number,
        required: false,
    },
    verificationCodeSentAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    resetLoginAttemptsToken: {
        type: String, // New field for login attempts reset token
        required: false,
    },
    loginAttemptsLeft: {
        type: Number,
        default: 7,
        required: false,
    },
    loginBlockExpiration: {
        type: Date,
        required: false,
    },
});

// Pre-save hook to update verificationCodeSentAt when verificationCode changes
recruiterSchema.pre('save', function (next) {
    if (this.isModified('verificationCode')) {
        this.verificationCodeSentAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
