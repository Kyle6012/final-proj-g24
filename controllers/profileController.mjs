import User from '../models/User.mjs';
import Post from '../models/Post.mjs';
import imagekit from '../config/imagekit.mjs';
import fs from 'fs';
import { FileId } from '../utils/file.mjs';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { username: req.params.username },
            include: { 
                model: Post,
                where: { status: 'approved' },
                required: false
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.render('profile', { user, loggedInUserId: req.user.id });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error fetching profile.' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, bio, location, website } = req.fields;
        
        if (!fullname) return res.status(400).json({ message: "Full name is required" });

        // Prepare update object with all fields
        const updateData = { fullname };
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;

        // Update the user record
        await User.update(updateData, { where: { id: req.user.id } });
        
        // Get the updated user data
        const updatedUser = await User.findByPk(req.user.id);

        // Emit WebSocket event with all updated fields
        res.io.emit("profileUpdated", { 
            username: updatedUser.username,
            fullname: updatedUser.fullname,
            bio: updatedUser.bio,
            location: updatedUser.location,
            website: updatedUser.website
        });
        
        // Create notification for the user
        const { createUserNotification } = await import('../controllers/notificationController.mjs');
        await createUserNotification({
            userId: req.user.id,
            title: 'Profile Updated',
            message: 'Your profile has been successfully updated.',
            type: 'profile_update'
        });

        // Return success response
        res.json({ 
            message: "Profile updated successfully", 
            user: {
                fullname: updatedUser.fullname,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website
            }
        });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

export const uploadProfilePic = async (req, res) => {
    const image = req.files.image;
    const fileName = `profile_${req.user.id}`;
    const fileBuffer = fs.readFileSync(image.path);

    if (!imagekit) {
        fs.unlinkSync(image.path);
        return res.status(503).json({ message: "Image upload service is not configured. Please set ImageKit credentials." });
    }

    const user = await User.findOne({ where: { id : req.user.id } });

    if (user.profilePic){
        try {
            await imagekit.deleteFile(FileId(user.profilePic));  
        } catch (e) {
            console.log("Error from imagekit: ", e.message);
        }
          
    }
    try {
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName,
            folder: 'profile-images',
            isPublished: true,
            timeout: 50000
        });

        if (response && response.url) {
            await User.update({ profilePic: response.url }, { where: { id: req.user.id } });

            res.io.emit("profileUpdated", { username: req.user.username, profilePic: response.url });

            fs.unlink(image.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });

            res.json({ message: "Profile picture updated successfully", profilePic: response.url });
        } else {
            res.status(400).json({ message: 'Error uploading to ImageKit', error: 'No URL received from ImageKit' });
        }
    } catch (err) {
        console.error('Error uploading image to ImageKit:', err);
        res.status(500).json({ message: 'Error uploading profile picture', error: err.message });
    }
};
