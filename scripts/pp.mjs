import User from '../models/User.mjs'; 
import bcrypt from 'bcryptjs';
import { Message } from '../models/Message.mjs';
import Post from '../models/Post.mjs';

// Fetch all users or a specific user by their ID
export const getUsers = async (req, res) => {
    try {
        // Fetch all users
        const users = await User.findAll();
        console.log(users);
    } catch (err) {
        console.error("Error fetching users: ", err.message);
    }
};

export const deletePost = async (postId) => {
    try{
        const post = await Post.destroy({ where: { id: postId } });
        console.log("Post deleted successfully");
    } catch (err) {
        console.error("Error deleting post: ", err.message);
    }
};

export const deleteMsg = async (senderId) => {
    try {
        const msg = await Message.destroy({ where: { senderId: senderId } });
        console.log("Messages deleted successfully");
    } catch (err) {
        console.error("Error deleting messages: ", err.message);
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await Post.findAll();
        console.log(posts);
    } catch (err) {
        console.error("Error fetching posts: ", err.message);
    }
}
// Fetch a user by ID
export const getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        // Fetch the user by their ID
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user by ID: ", err.message);
        res.status(500).json({ message: "Error fetching user by ID" });
    }
};

// Update a user's information
export const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { username, email, password, bio, profilePic } = req.body;

    try {
        // Find the user by ID and update their details
        const [updated] = await User.update(
            { username, email, password, bio, profilePic }, // New values
            { where: { id: userId } } // Condition to match the user
        );

        if (updated) {
            const updatedUser = await User.findOne({ where: { id: userId } });
            return res.status(200).json(updatedUser);
        }
        throw new Error('User not found or no change made');
    } catch (err) {
        console.error("Error updating user: ", err.message);
        res.status(500).json({ message: "Error updating user" });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const deleted = await User.destroy({ where: { id: userId } });

        if (deleted) {
            return res.status(200).json({ message: "User deleted successfully" });
        }
        return res.status(404).json({ message: "User not found" });
    } catch (err) {
        console.error("Error deleting user: ", err.message);
        res.status(500).json({ message: "Error deleting user" });
    }
};

export const deleteAllUsers = async (req, res) => {
    try {
        await User.destroy({ where: {} });
        console.log("Users deleted successully")
    } catch (err) {console.error("Error deleting all users", err.message);}
};

export const addUser = async (fullname, username, email, password, isVerified, isSubscribed) => {
    try {
        const hashPassword = await bcrypt.hash(password, 10);

        await User.create({
	    fullname,
            username,
            email,
            password: hashPassword,
            isVerified,
            isSubscribed,
        });
    } catch (err) { console.error(err.message)}
}
//getUsers();
//deleteAllUsers();
//addUser("G24 AI", "g24_ai", "g24@gmail.com", "catG24sike234", true, true);
//deleteMsg();
getAllPosts();
