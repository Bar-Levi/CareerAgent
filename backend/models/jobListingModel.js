const { NumberSchema } = require('firebase/vertexai');
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
    companySize: {
        type: String,
        required: true
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('JobListing', jobListingSchema);
