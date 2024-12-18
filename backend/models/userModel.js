const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
        enum: ['jobseeker', 'recruiter'],
        required: [true, 'Role is required'],
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
});

// Pre-save hook to update verificationCodeSentAt when verificationCode changes
userSchema.pre('save', function (next) {
    if (this.isModified('verificationCode')) {
        this.verificationCodeSentAt = new Date();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
