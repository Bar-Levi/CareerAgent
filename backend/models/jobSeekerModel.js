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


const jobSeekerSchema = new mongoose.Schema({
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
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
        type: String,
        enum: ['JobSeeker'],
        required: [true, 'Role is required'],
        default: 'JobSeeker',
    },
    phone: {
        type: String,
        trim: true,
    },
    cv: {
        type: String,
        required: false,
    },
    cvContent: {
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
    },
    relevancePoints: {
        type: Object,
        default: {
            matchedJobRolePoints: 10,
            matchedSecurityClearancePoints: 20,
            matchedEducationPoints: 20,
            matchedSkillPoints: 3,
            matchedWorkExperiencePoints: 30,
        },
    },
    minPointsForUpdate: {
        type: Number,
        default: 50,
    },
    isSubscribed: {
        type: Boolean,
        default: true,
    },
    numOfApplicationsSent: {
        type: Number,
        default: 0,
        required: false,
    },
    numOfReviewedApplications: {
        type: Number,
        default: 0,
        required: false,
    },
    numOfInterviewsScheduled: {
        type: Number,
        default: 0,
        required: false,
    },
    notifications: [notificationSchema],
    savedJobListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobListing' }],
});

// Pre-save hook to update verificationCodeSentAt when verificationCode changes
jobSeekerSchema.pre('save', function (next) {
    if (this.isModified('verificationCode')) {
        this.verificationCodeSentAt = new Date();
    }
    next();
});

module.exports = mongoose.models.JobSeeker ||
mongoose.model('JobSeeker', jobSeekerSchema);
