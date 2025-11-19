import Imagekit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

// ImageKit is optional - only initialize if credentials are provided
let imagekit = null;

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

if (IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT) {
    try {
        imagekit = new Imagekit({
            publicKey: IMAGEKIT_PUBLIC_KEY,
            privateKey: IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: IMAGEKIT_URL_ENDPOINT,
        });
        console.log('[ImageKit] ImageKit configured successfully');
    } catch (error) {
        console.error('[ImageKit] Error initializing ImageKit:', error.message);
        imagekit = null;
    }
} else {
    console.warn('[ImageKit] IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, or IMAGEKIT_URL_ENDPOINT not set. Image upload features will be disabled.');
}

export default imagekit;