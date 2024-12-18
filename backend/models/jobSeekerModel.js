const mongoose = require('mongoose');

const jobSeekerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    occupation: String,
    position: String,
    location: String,
    linkedIn: String,
    github: String,
    portfolio: String,
    phone: String,
    cv: String,
    profilePicture: String,
    isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
