const mongoose = require('mongoose');

// Admins are created only by scripts/seedAdmin.js. There is no sign-up route.
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    failedAttempts: { type: Number, default: 0 },
    lockCount: { type: Number, default: 0 }, // repeat lockouts, doubles the lock time
    lockUntil: { type: Date, default: null },
    otpHash: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    otpSentAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
