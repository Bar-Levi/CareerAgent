const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const JobSeeker = require('../models/jobSeekerModel');
const Recruiter = require('../models/recruiterModel');
const BlacklistedToken = require('../models/BlacklistedTokenModel');
const { sendAdminOtpEmail } = require('../utils/emailService');
const { cookieOptions, COOKIE } = require('../middleware/adminAuth');

const MAX_FAILS = 5;
const BASE_LOCK_MS = 15 * 60 * 1000;
const MAX_LOCK_MS = 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_TRIES = 3;
const RESEND_MS = 60 * 1000;
const SESSION_SECONDS = 30 * 60;

// Compared against when the email is unknown, so response time does not reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const secret = () => {
    if (!process.env.ADMIN_JWT_SECRET) throw new Error('ADMIN_JWT_SECRET is not set');
    return process.env.ADMIN_JWT_SECRET;
};
const hashOtp = (adminId, otp) =>
    crypto.createHmac('sha256', secret()).update(`${adminId}:${otp}`).digest('hex');
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// One generic message for every login failure, so nothing leaks about which part was wrong.
const loginFail = (res) =>
    res.status(401).json({ message: 'Invalid credentials, or too many attempts. Try again later.' });
const otpFail = (res) => res.status(401).json({ message: 'Invalid or expired code. Log in again.' });

const clearOtp = (id) =>
    Admin.updateOne({ _id: id }, { $set: { otpHash: null, otpExpires: null, otpAttempts: 0 } });

const issueOtp = async (admin) => {
    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await Admin.updateOne({ _id: admin._id }, {
        $set: {
            otpHash: hashOtp(admin.id, otp),
            otpExpires: new Date(Date.now() + OTP_TTL_MS),
            otpSentAt: new Date(),
            otpAttempts: 0,
            failedAttempts: 0,
        },
    });
    await sendAdminOtpEmail(admin.email, otp);
};

const challengeFor = (admin) =>
    jwt.sign({ sub: admin.id, purpose: 'otp' }, secret(), { expiresIn: '15m' });

const adminFromChallenge = async (token) => {
    try {
        const p = jwt.verify(str(token, 1000), secret());
        if (p.purpose !== 'otp') return null;
        const admin = await Admin.findById(p.sub);
        return admin && !(admin.lockUntil && admin.lockUntil > Date.now()) ? admin : null;
    } catch {
        return null;
    }
};

const login = async (req, res) => {
    try {
        const email = str(req.body.email).toLowerCase();
        const password = str(req.body.password);
        if (!email || !password) return loginFail(res);

        const admin = await Admin.findOne({ email });
        const ok = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
        // Locked accounts fail even with the right password.
        if (!admin || (admin.lockUntil && admin.lockUntil > Date.now())) return loginFail(res);

        if (!ok) {
            const a = await Admin.findByIdAndUpdate(admin._id, { $inc: { failedAttempts: 1 } }, { new: true });
            if (a.failedAttempts >= MAX_FAILS) {
                const lockMs = Math.min(BASE_LOCK_MS * 2 ** a.lockCount, MAX_LOCK_MS);
                await Admin.updateOne({ _id: a._id }, {
                    $set: { failedAttempts: 0, lockUntil: new Date(Date.now() + lockMs) },
                    $inc: { lockCount: 1 },
                });
            }
            return loginFail(res);
        }

        await issueOtp(admin);
        res.json({ challengeToken: challengeFor(admin) });
    } catch (e) {
        console.error('Admin login error:', e.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const resendOtp = async (req, res) => {
    try {
        const admin = await adminFromChallenge(req.body.challengeToken);
        if (!admin) return otpFail(res);
        const wait = admin.otpSentAt ? RESEND_MS - (Date.now() - admin.otpSentAt) : 0;
        if (wait > 0) return res.status(429).json({ message: `Wait ${Math.ceil(wait / 1000)}s before resending.` });
        await issueOtp(admin);
        res.json({ message: 'Code sent' });
    } catch (e) {
        console.error('Admin resend error:', e.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const otp = str(req.body.otp, 10);
        const admin = await adminFromChallenge(req.body.challengeToken);
        if (!admin || !/^\d{6}$/.test(otp) || !admin.otpHash || admin.otpExpires < Date.now()) return otpFail(res);

        // Count the try first, atomically, so parallel guesses cannot beat the limit.
        const a = await Admin.findOneAndUpdate(
            { _id: admin._id, otpHash: { $ne: null } },
            { $inc: { otpAttempts: 1 } },
            { new: true }
        );
        if (!a || a.otpAttempts > OTP_MAX_TRIES) {
            await clearOtp(admin._id);
            return otpFail(res);
        }

        const given = Buffer.from(hashOtp(admin.id, otp));
        const stored = Buffer.from(a.otpHash);
        if (!crypto.timingSafeEqual(given, stored)) {
            if (a.otpAttempts >= OTP_MAX_TRIES) {
                await clearOtp(admin._id);
                return otpFail(res);
            }
            // 400, not 401: the code is still alive, so the page stays on the OTP form.
            const left = OTP_MAX_TRIES - a.otpAttempts;
            return res.status(400).json({ message: `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.` });
        }

        // Single use: only one request can consume the code.
        const used = await Admin.findOneAndUpdate(
            { _id: admin._id, otpHash: a.otpHash },
            { $set: { otpHash: null, otpExpires: null, otpAttempts: 0, failedAttempts: 0, lockCount: 0, lastLoginAt: new Date() } }
        );
        if (!used) return otpFail(res);

        const token = jwt.sign({ sub: admin.id, role: 'admin' }, secret(), { expiresIn: SESSION_SECONDS });
        res.cookie(COOKIE, token, { ...cookieOptions(), maxAge: SESSION_SECONDS * 1000 });
        res.json({ email: admin.email });
    } catch (e) {
        console.error('Admin OTP error:', e.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = async (req, res) => {
    try {
        await BlacklistedToken.create({ token: req.adminToken, expiresAt: new Date(req.adminTokenExp * 1000) });
        res.clearCookie(COOKIE, cookieOptions());
        res.json({ message: 'Logged out' });
    } catch (e) {
        console.error('Admin logout error:', e.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const me = (req, res) => res.json({ email: req.admin.email });

const overview = async (req, res) => {
    try {
        const [js, jsVerified, rc, rcVerified] = await Promise.all([
            JobSeeker.countDocuments(),
            JobSeeker.countDocuments({ isVerified: true }),
            Recruiter.countDocuments(),
            Recruiter.countDocuments({ isVerified: true }),
        ]);
        res.json({
            totalUsers: js + rc,
            jobSeekers: { total: js, verified: jsVerified },
            recruiters: { total: rc, verified: rcVerified },
        });
    } catch (e) {
        console.error('Admin overview error:', e.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Explicit allow-lists: password, codes, tokens, pin, CV text and notifications are never selected.
const JOB_SEEKER_FIELDS = 'fullName email phone dateOfBirth cv githubUrl linkedinUrl profilePic isVerified';
const RECRUITER_FIELDS = 'fullName email dateOfBirth companyName companySize companyWebsite profilePic isVerified totalHired';

const listUsers = (Model, fields) => async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const q = str(req.query.search, 100);
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const filter = q ? { $or: [{ fullName: rx }, { email: rx }] } : {};
        const [total, docs] = await Promise.all([
            Model.countDocuments(filter),
            Model.find(filter).select(fields).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        ]);
        // No timestamps in these schemas, so the sign-up date comes from the ObjectId.
        const users = docs.map((d) => ({ ...d, signedUpAt: d._id.getTimestamp() }));
        res.json({ total, page, pages: Math.ceil(total / limit), users });
    } catch (e) {
        console.error('Admin list error:', e.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    login,
    resendOtp,
    verifyOtp,
    logout,
    me,
    overview,
    listJobSeekers: listUsers(JobSeeker, JOB_SEEKER_FIELDS),
    listRecruiters: listUsers(Recruiter, RECRUITER_FIELDS),
};
