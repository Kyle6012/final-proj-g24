import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sqz from '../config/db.mjs';

dotenv.config();

/**
 * This script ensures that the G24 AI user exists in the database
 * Run this script after setting up the database and before starting the server
 */
async function setupAIUser() {
  try {
    console.log('🤖 Setting up G24 AI user...');
    
    // Connect to database
    await sqz.authenticate();
    console.log('✅ Database connection established');
    
    // Check if AI user already exists
    const existingAI = await User.findOne({ where: { username: 'g24_ai' } });
    
    if (existingAI) {
      console.log('✅ G24 AI user already exists');
      return;
    }
    
    // Generate a secure random password for the AI user
    const password = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the AI user
    const aiUser = await User.create({
      fullname: 'G24 AI',
      username: 'g24_ai',
      email: 'g24ai@g24sec.space',
      password: hashedPassword,
      isVerified: true,
      profilePic: '/images/ai-avatar.png', // Make sure this file exists in your public/images directory
      bio: 'I am G24 AI, a cybersecurity assistant developed by the G24 team. My primary role is to guide users in ethical hacking, cybersecurity best practices, penetration testing, and tech problem-solving.',
    });
    
    console.log('✅ G24 AI user created successfully');
    console.log(`🆔 AI User ID: ${aiUser.id}`);
    
  } catch (error) {
    console.error('❌ Error setting up AI user:', error);
  } finally {
    // Close the database connection
    await sqz.close();
    process.exit(0);
  }
}

// Run the setup
setupAIUser();
