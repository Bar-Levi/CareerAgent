const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
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
    profilePic: {
        type: String,
        required: true,
    },
    applicationDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Applied', 'In review', 'Rejected', 'Accepted'],
        default: 'Applied',
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

applicantSchema.index({ jobSeekerId: 1 });
applicantSchema.index({ recruiterId: 1 });

const Applicant = mongoose.model('Applicant', applicantSchema);


module.exports = Applicant;
