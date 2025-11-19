import User from '../models/User.mjs';

// Update a user's bio by username
export const updateUserBio = async (username, newBio) => {
    try {
        // Find the user by username
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            console.log(`User "${username}" not found.`);
            return false;
        }
        
        console.log(`Found user: ${user.username} (${user.fullname})`);
        console.log(`Current bio: "${user.bio || 'No bio available'}"`);
        
        // Update the user's bio
        const [updated] = await User.update(
            { bio: newBio },
            { where: { username } }
        );
        
        if (updated) {
            // Verify the update
            const updatedUser = await User.findOne({ where: { username } });
            console.log(`\nBio updated successfully for ${updatedUser.username}!`);
            console.log(`New bio: "${updatedUser.bio}"`);
            return true;
        } else {
            console.log('No changes were made.');
            return false;
        }
    } catch (error) {
        console.error("Error updating user bio:", error.message);
        return false;
    }
};

// Get all users with their bios
export const listUserBios = async () => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'fullname', 'bio']
        });
        
        console.log('\nUser Bios:');
        console.log('==========');
        
        users.forEach(user => {
            console.log(`${user.username} (${user.fullname}): "${user.bio || 'No bio available'}"`);
        });
        
        return users;
    } catch (error) {
        console.error("Error fetching user bios:", error.message);
        return [];
    }
};

// Process command line arguments
const command = process.argv[2];
const username = process.argv[3];
const newBio = process.argv[4];

async function main() {
    if (command === 'update' && username && newBio) {
        await updateUserBio(username, newBio);
    } else if (command === 'list') {
        await listUserBios();
    } else {
        console.log('Usage:');
        console.log('  To update a bio: node updateBio.mjs update <username> "<new bio text>"');
        console.log('  To list all bios: node updateBio.mjs list');
    }
    
    // Exit process to avoid hanging
    process.exit(0);
}

// Run the main function
main();
