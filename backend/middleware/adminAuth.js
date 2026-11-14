const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedTokenModel');
const Admin = require('../models/adminModel');

const COOKIE = 'adminToken';

// Frontend and API share one site (careeragent-ai.online, localhost:3000/3001 in dev), so Strict works.
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/admin',
});

const readToken = (req) => {
    const part = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE}=`));
    return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : null;
};

const adminProtect = async (req, res, next) => {
    try {
        const token = readToken(req);
        if (!token || !process.env.ADMIN_JWT_SECRET) return res.status(401).json({ message: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });
        if (await BlacklistedToken.findOne({ token })) return res.status(401).json({ message: 'Unauthorized' });
        const admin = await Admin.findById(decoded.sub).select('email');
        if (!admin) return res.status(401).json({ message: 'Unauthorized' });
        req.admin = admin;
        req.adminToken = token;
        req.adminTokenExp = decoded.exp;
        next();
    } catch {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = { adminProtect, cookieOptions, COOKIE };
