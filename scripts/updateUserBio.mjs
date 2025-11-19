import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function listUsers() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'fullname']
        });
        
        console.log('\nAvailable users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.fullname})`);
        });
        
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function updateUserBio() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Connected to database successfully.');
        
        // List available users
        const users = await listUsers();
        
        if (users.length === 0) {
            console.log('No users found in the database.');
            rl.close();
            await sequelize.close();
            return;
        }
        
        // Ask which user to update
        const userIndexStr = await askQuestion('\nEnter the number of the user to update: ');
        const index = parseInt(userIndexStr) - 1;
        
        if (isNaN(index) || index < 0 || index >= users.length) {
            console.log('Invalid user selection.');
            rl.close();
            await sequelize.close();
            return;
        }
        
        const selectedUser = users[index];
        console.log(`\nSelected user: ${selectedUser.username} (${selectedUser.fullname})`);
        
        // Ask for new bio
        const newBio = await askQuestion('Enter new bio: ');
        
        try {
            // Update the user's bio
            await User.update(
                { bio: newBio },
                { where: { id: selectedUser.id } }
            );
            
            console.log(`\nBio updated successfully for ${selectedUser.username}!`);
            
            // Show the updated user
            const updatedUser = await User.findByPk(selectedUser.id);
            console.log('\nUpdated user information:');
            console.log(`Username: ${updatedUser.username}`);
            console.log(`Full Name: ${updatedUser.fullname}`);
            console.log(`Bio: "${updatedUser.bio}"`);
        } catch (error) {
            console.error('Error updating bio:', error);
        }
        
        rl.close();
        await sequelize.close();
    } catch (error) {
        console.error('Error connecting to database:', error);
        rl.close();
        await sequelize.close();
    }
}

// Run the function
updateUserBio();
