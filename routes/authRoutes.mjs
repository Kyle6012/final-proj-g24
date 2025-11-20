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

export default router;
