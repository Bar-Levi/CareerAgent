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
        enum: ['jobseeker'], // Fixed to 'jobseeker'
        required: [true, 'Role is required'],
        default: 'jobseeker', // Always set to 'jobseeker'
    },
    phone: {
        type: String,
        trim: true,
    },
    cv: {
        type: String, // Path or URL to uploaded CV
        required: false,
    },
    profilePic: {
        type: String, // Path or URL to uploaded profile picture
        required: false,
        default: 'https://res.cloudinary.com/demooji6w/image/upload/v1735084555/user_1_psxsus.png'
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
        default: Date.now, // Automatically set to current date
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    dateOfBirth: {
        type: Date,
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
