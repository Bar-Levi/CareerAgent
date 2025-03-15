const mongoose = require('mongoose');

// Create a new schema for notifications
const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    extraData: {
        type: {},
        required: false
    }
});

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
        minlength: [8, 'Password must be at least 8 characters long'],
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['Recruiter'],
        required: [true, 'Role is required'],
        default: 'Recruiter',
    },
    profilePic: {
        type: String,
        required: false,
        default: 'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png',
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
    dateOfBirth: {
        type: Date,
        required: false,
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
    pin: {
        type: String,
    },
    notifications: [notificationSchema],
});

// Pre-save hook to update verificationCodeSentAt when verificationCode changes
recruiterSchema.pre('save', function (next) {
    if (this.isModified('verificationCode')) {
        this.verificationCodeSentAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
