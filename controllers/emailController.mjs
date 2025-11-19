import { sendCustomEmail } from "../utils/emailService.mjs";

export const sendBatchEmail = async (req, res) => {
    const { emails, subjet, message } = req.body;
    try { 
        await sendCustomEmail(emails, subjet, message);
        res.json({ message: 'Email sent successfully' });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Error sending email' });
    }
};