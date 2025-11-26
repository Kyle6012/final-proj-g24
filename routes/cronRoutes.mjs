import express from 'express';
import { sendCyberAlerts } from '../cronJobs.mjs';

const router = express.Router();

// Middleware to verify Vercel Cron signature or a custom secret
const verifyCron = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // Allow if CRON_SECRET matches (Bearer token)
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        return next();
    }

    // Also check for Vercel's specific header if you want to rely on that
    // but a shared secret is often easier to test and manage

    return res.status(401).json({ error: 'Unauthorized' });
};

router.get('/daily-alerts', verifyCron, async (req, res) => {
    try {
        console.log('Triggering daily alerts via API...');
        await sendCyberAlerts();
        res.json({ success: true, message: 'Daily alerts triggered' });
    } catch (error) {
        console.error('Error triggering daily alerts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
