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
    linkedin_url: {
        type: String,
    },
    github_url: {
        type: String,
    },
    cv_url: {
        type: String,
        required: true,
    },
    application_date: {
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
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobListing',
        required: true,
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
    },
    job_seeker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
        required: true,
    },
    job_title: {
        type: String,
    },
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
