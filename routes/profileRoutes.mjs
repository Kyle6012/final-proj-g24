import express from 'express';
import formidable from 'express-formidable'; // To parse form data (including files)
import { isAuthenticated } from '../middleware/authMiddleware.mjs';
import { getProfile, updateProfile, uploadProfilePic } from '../controllers/profileController.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Middleware to handle form data parsing directly in the route
router.use(formidable({
    multiples: false, 
    uploadDir: path.join(__dirname, '../uploads/profile'), // Set the upload directory
    keepExtensions: true, // Retain the original file extensions
    maxFileSize: 5 * 1024 * 1024, // Limit file size to 5MB
}));

// Route to view profile
router.get('/:username', isAuthenticated, getProfile);

// Route to update profile bio
router.post('/update', isAuthenticated, updateProfile);

// Route to upload profile picture using formidable middleware
router.post('/upload-profile-pic', isAuthenticated, uploadProfilePic);

export default router;
