const mongoose = require('mongoose');

const jobSeekerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address',
        ],
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
        type: String,
        enum: ['jobseeker'],
        required: [true, 'Role is required'],
        default: 'jobseeker',
    },
    phone: {
        type: String,
        trim: true,
    },
    cv: {
        type: String,
        required: false,
    },
    profilePic: {
        type: String,
        required: false,
        default: 'https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png',
    },
    githubUrl: {
        type: String,
        trim: true,
        required: false,
    },
    linkedinUrl: {
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
    dateOfBirth: {
        type: Date,
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
    analyzed_cv_content: {
        type: {},
        required: false,
    }
});

// Pre-save hook to update verificationCodeSentAt when verificationCode changes
jobSeekerSchema.pre('save', function (next) {
    if (this.isModified('verificationCode')) {
        this.verificationCodeSentAt = new Date();
    }
    next();
});

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
