import cron from 'node-cron';
import { sendCyberAlerts } from './utils/cyberAlert.mjs';

export function initCronJob() {
    // Schedule to run every day at 9 AM
    cron.schedule("0 9 * * *", async () => {
        console.log("Sending daily alerts ...");
        await sendCyberAlerts();
    });
}
