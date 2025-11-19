import axios from 'axios';
import User from '../models/User.mjs';
import { sendCyberAlertEmail } from './emailService.mjs';

// fetch cve alerts 
const fetchCVEAlerts = async () => {
    try {
        const response = await axios.get("https://cve.circl.lu/api.last");
        return response.data.slice(0, 5); //top 5 latest CVEs
    } catch (e) {
        console.error("Error fetching CVE alerts: ", e);
        return [];
    }
};

// fetch cybersecurity news 
const fetchCyberNews = async () => {
    // NewsAPI is optional - skip if no API key provided
    if (!process.env.NEWS_API_KEY) {
        console.log("NewsAPI key not provided, skipping news fetch");
        return [];
    }
    
    try{
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=technology&q=cybersecurity&apiKey=${process.env.NEWS_API_KEY}`);
        return response.data.articles.slice(0, 5); // top 5 news articles
    } catch (e) {
        console.error("Error fetching news: ", e);
        return [];
    }
};

// send alerts via email
export const sendCyberAlerts = async () => {
    const users = await User.findAll({ where: { isVerified: true } });
    const cveAlerts = await fetchCVEAlerts();
    const cyberNews = await fetchCyberNews();

    for (const user of users) {
        await sendCyberAlertEmail(user.email, cveAlerts, cyberNews);
    }
};