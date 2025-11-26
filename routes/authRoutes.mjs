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
router.get('/logout', logout);

export default router;
