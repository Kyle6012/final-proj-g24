#!/usr/bin/env node

import dotenv from 'dotenv';
import sqz from './config/db.mjs';

// Import all models to ensure they're registered with Sequelize
import './models/User.mjs';
import './models/Post.mjs';
import './models/Comment.mjs';
import './models/Like.mjs';
import './models/Message.mjs';
import './models/Notifications.mjs';
import './models/Community.mjs';
import './models/CommunityMember.mjs';
import './models/Admin.mjs';
import './models/Follow.mjs';
import './models/associations.mjs';

// Load .env.production file instead of .env
dotenv.config({ path: '.env.production' });

console.log('🚀 Starting Production Database Setup...\n');
console.log('📍 Database:', process.env.DATABASE_URL ? 'Neon DB (Production)' : 'Local PostgreSQL');

async function setupDatabase() {
    try {
        // Test connection
        console.log('\n🔌 Testing database connection...');
        await sqz.authenticate();
        console.log('✅ Database connection established successfully.\n');

        // Sync all models (create/update tables)
        console.log('📊 Creating/updating database tables...');
        await sqz.sync({ alter: true });
        console.log('✅ All tables created/updated successfully!\n');

        // List all tables created
        console.log('📋 Tables in database:');
        const [results] = await sqz.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        results.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });

        console.log('\n✅ Production database setup complete!');
        console.log('🎉 Your Neon DB is ready to use.\n');

    } catch (error) {
        console.error('\n❌ Error setting up database:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.parent) {
            console.error('Parent error:', error.parent.message);
        }
        console.error('\nFull error:', error);
        console.error('\nPlease check:');
        console.error('1. DATABASE_URL is correctly set in .env.production');
        console.error('2. Your Neon DB is accessible');
        console.error('3. You have the necessary permissions\n');
        process.exit(1);
    } finally {
        await sqz.close();
    }
}

setupDatabase();
