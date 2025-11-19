import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { login, signup, verifyEmail, logout, forgotPassword, resetPassword } from '../controllers/authController.mjs';
import User from '../models/User.mjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// local auth
router.get('/login', async (req, res) => {
    res.render('login', { error_msg: null, success_msg: null });
});

router.post('/login', login);

router.get('/signup', async (req, res) => res.render("signup"));    
router.post('/signup', signup);
router.get('/verify/:token', verifyEmail);
router.get('/forgot-password', async (req, res) => res.render("forgotPassword"));
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', async (req, res) => res.render("resetPassword", { token: req.params.token }));
router.post('/reset-password/:token', resetPassword);
router.get('/logout', logout);
router.get('/signup/complete/verify', async (req, res) => res.render('sign-verifier'));
// Google auth
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));
router.get('/google/callback', (req, res, next) => {
    passport.authenticate("google", async (err, user, info) => {
        /*if (err) {
            return res.status(500).render('error', { message: 'Internal Server Error' });
            console.error(err);
        }*/
        /*if (!user) {
            return res.status(401).render('error', { message: 'Failed to authenticate with Google' });
        }*/

        req.logIn(user, async (/*loginErr*/) => {
            /*if (loginErr) {
                return res.status(500).render('error', { message: 'Login error' });
                console.error(loginErr);
            }*/

            console.log(user);
            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '48h' });
            res.cookie('userToken', token, { maxAge: 3600000, httpOnly: true });
            return res.status(200).json({ message: 'You have successfully logged in with Google', token });
        });
    })(req, res, next);
});

// GitHub auth
router.get('/github', passport.authenticate("github", { scope: ["user:email"] }));
router.get('/github/callback', (req, res, next) => {
    passport.authenticate("github", async (err, user, info) => {
        if (err) {
            return res.status(500).render('error', { message: 'Internal Server Error' });
            console.log(err);
        }
        if (!user) {
            return res.status(401).render('error', { message: 'Failed to authenticate with GitHub' });
        }

        req.logIn(user, async (loginErr) => {
            if (loginErr) {
                return res.status(500).render('error', { message: 'Login error' });
                console.log(loginErr);
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '48h' });
            res.cookie('userToken', token, { maxAge: 3600000, httpOnly: true });
            return res.status(200).json({ message: 'You have successfully logged in with GitHub', token });
        });
    })(req, res, next);
});

export default router;
