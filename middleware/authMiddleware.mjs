import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.mjs';

dotenv.config();

export const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.userToken;
    if (!token) return res.redirect('/auth/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, username: decoded.username };
        next();
    } catch (err) {
        // Check if user is already logged in
        if (req.user) return next();
        res.redirect('/auth/login');
    }
};

export const isAdmin = async (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) return res.redirect('/admin/auth/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.render('error', { message: "Acess Denied" });
        req.admin = decoded;
        next();
    } catch (e) {
        res.redirect('/admin/auth/login');
    }
};
