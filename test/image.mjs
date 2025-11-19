import Imagekit from 'imagekit';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


// Test direct upload
const filePath = '/home/bealthguy/Public/projects/cybersec connect/express/public/images/default.png';
const fileBuffer = fs.readFileSync(filePath);

imagekit.upload({
    file: fileBuffer,
    fileName: 'default.png',
    folder: 'profile-images',
    isPublished: true
}).then(response => {
    console.log('Upload successful:', response);
}).catch(error => {
    console.error('Upload failed:', error);
});
