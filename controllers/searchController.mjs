import User from '../models/User.mjs';
import Post from '../models/Post.mjs';
import { Op } from 'sequelize';
import sequelize from '../config/db.mjs';

export const searchUsers = async (req, res) => {
    const query = req.query.q;
    const currentUser = req.user;
    
    try {
        let users = [];
        
        if (query) {
            // Search for users by username or fullname
            users = await User.findAll({
                where: {
                    [Op.or]: [
                        { username: { [Op.iLike]: `%${query}%` } },
                        { fullname: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                attributes: ['id', 'username', 'fullname', 'profilePic', 'bio']
            });
            
            // If we have a logged-in user, check which users they are following
            if (currentUser) {
                try {
                    // Check if Follows table exists
                    const tableCheckQuery = `
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = 'Follows'
                        );
                    `;
                    
                    const tableExists = await sequelize.query(tableCheckQuery, {
                        type: sequelize.QueryTypes.SELECT
                    });
                    
                    if (tableExists[0].exists) {
                        // Get the list of users the current user is following
                        const followingQuery = `
                            SELECT "followingId" 
                            FROM "Follows" 
                            WHERE "followerId" = :userId
                        `;
                        
                        const followingResults = await sequelize.query(followingQuery, {
                            replacements: { userId: currentUser.id },
                            type: sequelize.QueryTypes.SELECT
                        });
                        
                        const followingIds = followingResults.map(result => result.followingId);
                        
                        // Add isFollowing property to each user
                        users = users.map(user => {
                            const userData = user.toJSON();
                            userData.isFollowing = followingIds.includes(userData.id);
                            return userData;
                        });
                    } else {
                        // Follows table doesn't exist, set isFollowing to false for all users
                        users = users.map(user => {
                            const userData = user.toJSON();
                            userData.isFollowing = false;
                            return userData;
                        });
                    }
                } catch (error) {
                    console.error('Error checking follows:', error);
                    // Set isFollowing to false for all users in case of error
                    users = users.map(user => {
                        const userData = user.toJSON();
                        userData.isFollowing = false;
                        return userData;
                    });
                }
            }
        }
        
        // Render the search page with results
        res.render('search', { 
            users, 
            query, 
            currentUser
        });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).render('error', { message: 'An error occurred during search' });
    }
};

// Search for posts (to be implemented)
export const searchPosts = async (req, res) => {
    const query = req.query.q;
    
    try {
        let posts = [];
        
        if (query) {
            posts = await Post.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { content: { [Op.iLike]: `%${query}%` } }
                    ],
                    status: 'approved'
                },
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'profilePic']
                }],
                order: [['createdAt', 'DESC']]
            });
        }
        
        res.json({ posts });
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ message: 'An error occurred during post search' });
    }
};
