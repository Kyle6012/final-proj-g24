import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function checkUserData() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Connected to database successfully.');
        
        // Get all users
        const users = await User.findAll();
        console.log(`\nFound ${users.length} users in database:\n`);
        
        // Display user information
        users.forEach(user => {
            console.log(`User ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Full Name: ${user.fullname}`);
            console.log(`Bio: "${user.bio || 'No bio available'}"`);
            console.log(`Location: ${user.location || 'Not specified'}`);
            console.log(`Website: ${user.website || 'Not specified'}`);
            console.log(`Profile Picture: ${user.profilePic ? 'Yes' : 'No'}`);
            console.log('-'.repeat(50));
        });
        
    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the function
checkUserData();
