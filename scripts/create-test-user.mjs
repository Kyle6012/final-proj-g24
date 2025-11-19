import User from '../models/User.mjs';
import sqz from '../config/db.mjs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createTestUser() {
  try {
    await sqz.authenticate();
    console.log('Connected to database');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { username: 'testuser' } });
    if (existingUser) {
      console.log('Test user already exists, updating to verified status');
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('Test user updated successfully');
      return;
    }
    
    // Create a new test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newUser = await User.create({
      id: uuidv4(),
      fullname: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: true
    });
    
    console.log('Test user created successfully:');
    console.log(`Username: ${newUser.username}`);
    console.log(`Email: ${newUser.email}`);
    console.log(`Password: password123`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
