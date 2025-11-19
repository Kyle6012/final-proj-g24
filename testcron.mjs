import express from 'express';
import { sendCyberAlerts } from './utils/cyberAlert.mjs';

const app = express();

app.get('/trigger-alerts', async (req, res) => {
    try {
        await sendCyberAlerts();
        res.status(200).send('Alerts sent successfully');
    } catch (error) {
        console.error('Error sending alerts:', error);
        res.status(500).send('Failed to send alerts');
    }
});

// Example of running an HTTP server
app.listen(3000, () => {
    console.log("Server is running...");
});
