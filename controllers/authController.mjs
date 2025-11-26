import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';
import dotenv from 'dotenv';
import { generateUniqueUsername } from '../utils/names.mjs';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

dotenv.config();

export const signup = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const fullName = firstName + ' ' + lastName;
        const username = await generateUniqueUsername(firstName, lastName);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-verify user since email service is disabled
        const newUser = await User.create({
            fullname: fullName,
            username,
            email,
            password: hashedPassword,
            isVerified: true, // Auto-verified
            verificationToken: null,
            verificationTokenExpires: null,
        });

        // Automatically log the user in after signup
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "7d", });
        res.cookie('userToken', token, { maxAge: 3600000, httpOnly: true });

        return res
            .status(200)
            .json({ message: 'Signup successful. Logging you in...', token });
    } catch (e) {
        console.error(e);
        res
            .status(500)
            .json({ message: 'Internal server error', error: e.message });
    }
};


export const login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({ where: { [Op.or]: [{ username: identifier }, { email: identifier }] } });

        if (!user) return res.status(404).json({ message: 'User not found' });
        // Email verification check removed
        // if (user.isVerified != true) return res.status(403).json({ message: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d", });
        res.cookie('userToken', token, { maxAge: 3600000, httpOnly: true });
        return res.status(200).json({ message: 'Login succesfull', token });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'An error occured. Retry again.' });
    }
};

// logout 
export const logout = async (req, res) => {
    req.logout(err => {
        if (err) console.error(err);
        res.redirect("/");
    });
};

// email verification (Disabled)
export const verifyEmail = async (req, res) => {
    res.render('error', { message: "Email verification is disabled." });
};

// forgot password (Disabled)
export const forgotPassword = async (req, res) => {
    res.json({ message: "Password reset is currently disabled. Please contact an administrator." });
};

// reset password (Disabled)
export const resetPassword = async (req, res) => {
    res.render('error', { message: "Password reset is disabled." });
};
