import Pusher from 'pusher';
import dotenv from 'dotenv';

dotenv.config();

let pusher;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
    pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: true
    });
    console.log('Pusher initialized successfully');
} else {
    console.warn('Pusher credentials missing. Real-time features will be disabled.');
    // Mock pusher to prevent crashes if not configured
    pusher = {
        trigger: async (channel, event, data) => {
            console.log(`[Pusher Mock] Triggered event '${event}' on channel '${channel}'`);
            return true;
        }
    };
}

export default pusher;
