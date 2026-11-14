// Usage: ADMIN_EMAIL=a@b.com ADMIN_PASSWORD='...' node scripts/seedAdmin.js
// Creates the admin, or resets its password and lock state if it already exists.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel');

(async () => {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!email || password.length < 10) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars).');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.updateOne(
        { email },
        { $set: { passwordHash, failedAttempts: 0, lockCount: 0, lockUntil: null, otpHash: null, otpExpires: null, otpAttempts: 0 } },
        { upsert: true }
    );
    console.log(`Admin ready: ${email}`);
    await mongoose.disconnect();
})().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
