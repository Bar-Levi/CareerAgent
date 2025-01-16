const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    linkedinUrl: {
        type: String,
    },
    githubUrl: {
        type: String,
    },
    cv: {
        type: String,
        required: true,
    },
    applicationDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['applied', 'in review', 'rejected', 'accepted'],
        default: 'applied',
    },
    notes: {
        type: String,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobListing',
        required: true,
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
    },
    jobSeekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
        required: true,
    },
    jobTitle: {
        type: String,
    },
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
