import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection parameters
const DB_NAME = process.env.DB_NAME || 'g24sec';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Perseus.2025';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false
});

// Define User model for query
const User = sequelize.define('User', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true
    },
    username: Sequelize.STRING,
    fullname: Sequelize.STRING,
    bio: Sequelize.TEXT,
    location: Sequelize.STRING,
    website: Sequelize.STRING,
    profilePic: Sequelize.STRING
}, {
    tableName: 'Users',
    timestamps: true
});

// Get command line arguments
const username = process.argv[2];
const newBio = process.argv[3];

if (!username || !newBio) {
    console.log('Usage: node fixUserBio.mjs <username> "<new bio text>"');
    process.exit(1);
}

async function updateUserBio() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Connected to database successfully.');
        
        // Find the user
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            console.log(`User "${username}" not found.`);
            await sequelize.close();
            return;
        }
        
        console.log(`Found user: ${user.username} (${user.fullname})`);
        console.log(`Current bio: "${user.bio || 'No bio available'}"`);
        
        // Update the user's bio
        await User.update(
            { bio: newBio },
            { where: { id: user.id } }
        );
        
        // Verify the update
        const updatedUser = await User.findByPk(user.id);
        console.log(`\nBio updated successfully for ${updatedUser.username}!`);
        console.log(`New bio: "${updatedUser.bio}"`);
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
    }
}

// Run the function
updateUserBio();
