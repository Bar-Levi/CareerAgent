const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
    jobRole: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    companySize: {
        type: String,
        required: true
    },
    companyWebsite: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v);
            },
            message: 'Invalid URL format.'
        },
        default: null
    },
    experienceLevel: {
        type: String,
        required: true,
        enum: [
            'Entry',
            'Senior',
            'Junior',
            'Internship',
            'Associate',
            'Director',
            'Mid Senior',
            'Executive'
        ]
    },
    jobType: {
        type: [String],
        required: true,
        enum: ['Full Time', 'Part Time', 'Contract', 'Student']
    },
    remote: {
        type: String,
        required: true,
        enum: ['Hybrid', 'On Site', 'Remote']
    },
    description: {
        type: String,
        required: true
    },
    securityClearance: {
        type: Number,
        default: null
    },
    education: {
        type: [String],
        default: []
    },
    workExperience: {
        type: Number,
        default: null
    },
    skills: {
        type: [String],
        default: []
    },
    languages: {
        type: [String],
        default: []
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
    },
    recruiterName: {
        type: String,
        required: true,
        ref: 'Recruiter'
    },
    recruiterProfileImage: {
        type: String,
        required: true,
        ref: 'Recruiter'
    },
    applicants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Applicant', // Reference to the Applicant model
        },
    ],
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Paused', 'Closed'],
        default: 'Active'
    },
    closingTime: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

jobListingSchema.path('applicants').default(() => []);

module.exports = mongoose.model('JobListing', jobListingSchema);
