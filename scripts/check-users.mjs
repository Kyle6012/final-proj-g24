import User from '../models/User.mjs';
import sqz from '../config/db.mjs';

async function checkUsers() {
  try {
    await sqz.authenticate();
    console.log('Connected to database');
    
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);
    
    users.forEach(user => {
      console.log(`Username: ${user.username}, Email: ${user.email}, Verified: ${user.isVerified}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
