const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyName: { type: String, required: true },
    companyOccupation: { type: String, required: true },
    companySize: { type: String, required: true },
    companyWebsite: String,
    profilePicture: String,
    isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
