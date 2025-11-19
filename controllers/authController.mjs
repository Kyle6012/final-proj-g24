import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.mjs';
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
  
      const verificationToken = uuidv4();
      const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const newUser = await User.create({
        fullname: fullName,
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires: expirationTime,
      });

      await sendVerificationEmail(email, verificationToken);
  
      return res
        .status(200)
        .json({ message: 'Signup successful.' });
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
        if (user.isVerified != true) return res.status(403).json({ message: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({ message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d", });
        res.cookie('userToken', token, { maxAge:3600000, httpOnly: true });
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

//email verification
export const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({ where: {  verificationToken: token } });
        if(!user || user.verificationTokenExpires < new Date()) return res.render('error', { message: "Invalid  or expired verification link." });

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        res.render('verify');
    } catch (err) {
        console.error(err);
        res.render('error', { message: "Verification Failed." });
    }
};

// forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try{
        const user = await User.findOne({ where: { email } });
        if (!user) return res.json({ message: "No account with this email." });

        const resetToken = uuidv4();
        const expirationTime = new Date(Date.now() + 1 * 60 * 60 * 1000); // expires in 1 hour 

        user.resetToken = resetToken;
        user.resetTokenExpires = expirationTime;
        await user.save();

        await sendPasswordResetEmail(email, resetToken);
        res.json({ message: "Password reset link has been sent to your email it expires in 1 hour." });
    } catch (err) {
        console.error(err);
        res.render('error', { message: "Error processing request" });
    }
};

// reset password
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const password = req.body;

    try {
        const user = await User.findOne({ where: { resetToken: token } });
        if (!user || user.resetTokenExpires < new Date()) return res.render('error', { message: "Invalid or expired reset Link" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({ message: "Password reset successfully" });
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('error', { message: "Failed to reset password" });
    }
};
