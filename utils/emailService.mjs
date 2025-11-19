import nodemailer from 'nodemailer';

const SMTP_USERNAME = process.env.BREVO_SMTP_USERNAME;
const SMTP_PASSWORD = process.env.BREVO_SMTP_PASSWORD;
const BASE_URL = process.env.BASE_URL;
const DISABLE_EMAIL = process.env.DISABLE_EMAIL === 'true';

if (!DISABLE_EMAIL && (!SMTP_USERNAME || !SMTP_PASSWORD)) {
    throw new Error("The BREVO_SMTP_USERNAME or BREVO_SMTP_PASSWORD environment variables are not set. Set DISABLE_EMAIL=true to bypass email functionality.");
}

// Create a mock transporter if email is disabled
const transporter = DISABLE_EMAIL ? {
    sendMail: (options) => {
        console.log('Email sending disabled. Would have sent:', {
            to: options.to,
            subject: options.subject,
            // Don't log the full HTML content to keep logs clean
        });
        return Promise.resolve({ response: 'Email sending disabled' });
    }
} : nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587, // or 465 for secure connection
    secure: false, // use true for 465
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
});

const logoUrl = `${process.env.BASE_URL}/images/logo.png`;

// Function to send verification email
export const sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: `"cybersec connect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Please Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%;" />
                </center>

                <h2>Welcome to G24Sec!</h2>
                <p>Thank you for signing up with us. To get started, please verify your email address by clicking the link below:</p>
                <p style="font-size: 18px;">
                    <a href="${BASE_URL}/auth/verify/${token}" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 15px; border-radius: 5px;">Verify Your Email</a>
                </p>
                <p>If you did not sign up for our service, please ignore this email.</p>
                <p>Best Regards,<br>The G24Sec Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Function to send new topic notification email
export const sendNewTopicNotificationEmail = async (recipientEmail, username, forumName, topicTitle, topicUrl) => {
    const mailOptions = {
        from: `"G24Sec Notifications" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `New Transmission in ${forumName}: "${topicTitle}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:100px; height:auto; border-radius:50%; margin-bottom: 15px;" />
                </center>

                <h2>New Transmission detected in ${forumName}</h2>
                <p>Hello ${username},</p>
                <p>A new topic titled "<strong>${topicTitle}</strong>" has just been posted in the forum "<strong>${forumName}</strong>" that you are a member of.</p>
                <p style="font-size: 16px; text-align: center; margin-top: 25px; margin-bottom: 25px;">
                    <a href="${topicUrl}" style="text-decoration: none; background-color: var(--primary-accent-color, #00FF41); color: var(--button-text-color, #0D0208); padding: 10px 18px; border-radius: 5px; font-weight: bold;">View Topic</a>
                </p>
                <p>Join the discussion and share your insights!</p>
                <p>Regards,<br>The G24Sec Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`New topic notification email sent to ${recipientEmail}:`, info.response);
    } catch (error) {
        console.error(`Error sending new topic email to ${recipientEmail}:`, error);
    }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email, token) => {
    const mailOptions = {
        from: `"cybersec connect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%;" />
                </center>

                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. You can do so by clicking the link below:</p>
                <p style="font-size: 18px;">
                    <a href="${BASE_URL}/auth/reset-password/${token}" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 15px; border-radius: 5px;">Reset Your Password</a>
                </p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Best Regards,<br>The G24Sec Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Function to send cyber alerts emailss
/**
 * Sends cybersecurity alert email with formatted content
 * @param {string} email Recipient email address
 * @param {Array} cveAlerts Array of CVE objects
 * @param {Array} cyberNews Array of news articles
 * @returns {Promise<boolean>} True if email was sent successfully
 */
export const sendCyberAlertEmail = async (email, cveAlerts = [], cyberNews = []) => {
    try {
        // Format current date
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format CVE alerts with severity styling
        const cveContent = cveAlerts.length > 0 
            ? cveAlerts.map(cve => {
                const severityColor = 
                    cve.severity === 'CRITICAL' ? '#d32f2f' :
                    cve.severity === 'HIGH' ? '#f57c00' :
                    cve.severity === 'MEDIUM' ? '#fbc02d' : '#689f38';
                
                return `
                    <li style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid ${severityColor};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 1.1em; color: ${severityColor};">${cve.id || 'Unknown CVE'}</strong>
                            <span style="background-color: ${severityColor}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8em;">
                                ${cve.severity || 'UNKNOWN'}${cve.cvssScore ? ` (${cve.cvssScore})` : ''}
                            </span>
                        </div>
                        <div style="margin-top: 8px; font-size: 0.9em; color: #555;">
                            <div><strong>Published:</strong> ${cve.publishedDate}</div>
                            <div style="margin-top: 5px;">${cve.description}</div>
                        </div>
                    </li>
                `;
            }).join("")
            : `<li style="padding: 15px; background-color: #f9f9f9; text-align: center; color: #666;">
                No new critical vulnerabilities to report today
               </li>`;

        // Format news articles
        const newsContent = cyberNews.length > 0
            ? cyberNews.map(news => `
                <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; gap: 15px;">
                        ${news.imageUrl ? `
                            <img src="${news.imageUrl}" alt="${news.title}" style="width: 80px; height: 60px; object-fit: cover;"/>
                        ` : ''}
                        <div>
                            <a href="${news.url}" style="color: #1976d2; text-decoration: none; font-weight: bold;">
                                ${news.title}
                            </a>
                            <div style="font-size: 0.85em; color: #666; margin-top: 3px;">
                                ${news.source ? `<span>${news.source}</span>` : ''}
                                ${news.publishedAt ? `<span style="margin-left: 10px;">${news.publishedAt}</span>` : ''}
                            </div>
                            ${news.description ? `
                                <p style="margin: 8px 0 0 0; font-size: 0.9em; color: #444;">
                                    ${news.description}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </li>
            `).join("")
            : `<li style="padding: 15px; background-color: #f9f9f9; text-align: center; color: #666;">
                No cybersecurity news updates today
               </li>`;

        const mailOptions = {
            from: `"cybersec connect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Daily Cybersecurity Briefing - ${dateString}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 650px; margin: 0 auto; color: #333;">
                    <!-- Header -->
                    <div style="background-color: #1976d2; padding: 25px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 1.8em;">Daily Security Briefing</h1>
                        <p style="margin: 5px 0 0; opacity: 0.9;">${dateString}</p>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 25px;">
                        <p style="margin-bottom: 20px;">Dear Subscriber,</p>
                        
                        <p>Here's your daily update on critical vulnerabilities and cybersecurity news:</p>

                        <!-- CVEs Section -->
                        <h2 style="color: #d32f2f; margin-top: 25px; padding-bottom: 5px; border-bottom: 2px solid #d32f2f;">
                            Latest Critical Vulnerabilities
                        </h2>
                        <ul style="list-style-type: none; padding-left: 0; margin-top: 15px;">
                            ${cveContent}
                        </ul>

                        <!-- News Section -->
                        <h2 style="color: #1976d2; margin-top: 35px; padding-bottom: 5px; border-bottom: 2px solid #1976d2;">
                            Cybersecurity News Updates
                        </h2>
                        <ul style="list-style-type: none; padding-left: 0; margin-top: 15px;">
                            ${newsContent}
                        </ul>

                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
                            <p style="margin-bottom: 10px;">
                                <strong>Important:</strong> Review these vulnerabilities and apply patches as needed.
                            </p>
                            <p style="margin: 5px 0;">
                                To manage your alert preferences, visit your account settings.
                            </p>
                            <p style="margin: 20px 0 5px;">
                                Stay secure,<br>
                                <strong style="color: #1976d2;">The G24 Security Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return false;
    }
};

// Function to send welcome email
export const sendWelcomeEmail = async (email, username) => {
    const mailOptions = {
        from: `"G24Sec" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'HELLO AGENT!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%; margin-bottom: 20px;" />
                </center>

                <h2>Welcome aboard, Agent ${username}!</h2>
                <p>You are now active and set to dive into the secure channels and engage with the community.</p>
                <p>Here are a few things you can do to get started:</p>
                <ul>
                    <li>Explore the <a href="${BASE_URL}/feed" style="color: #1976d2;">CyberFeed</a> for the latest threat reports.</li>
                    <li>Join discussions in the <a href="${BASE_URL}/d/forums" style="color: #1976d2;">Forums</a>.</li>
                    <li>Update your <a href="${BASE_URL}/profile/${username}" style="color: #1976d2;">Agent Profile</a>.</li>
                </ul>
                <p>If you have any questions, don't hesitate to reach out through our <a href="${BASE_URL}/d/forums/general-discussion" style="color: #1976d2;">support channels or ask in the community forums</a>.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="${BASE_URL}/feed" style="text-decoration: none; background-color: #00FF41; color: #0D0208; padding: 12px 20px; border-radius: 5px; font-weight: bold;">Jump into the Conversation!</a>
                </p>
                <p style="margin-top: 30px;">Secure regards,<br>The G24Sec Command</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}:`, info.response);
    } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
        // Do not throw here, as it's a non-critical welcome email
    }
};


export const sendCustomEmail = async (recipients, subject, message) => {
    const mailOptions = {
        from: `"cybersec connect" <${process.env.EMAIL_USER}>`,
        to: recipients.map(email => ({ email })), // Corrected: Brevo expects array of objects or comma-separated string
        subject: subject,
        html: `<p>${message}</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending custom email:", error);
    }
};

export const notifyAllUsersOfNewPost = async (users, postTitle, postSummary) => {
    const mailOptionsTemplate = (email) => ({
        from: `"cybersec connect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🚨 New Intel Drop: ${postTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
                <center>
                    <img src="${logoUrl}" alt="G24Sec Logo" style="width:150px; height:auto; border-radius:50%;" />
                </center>

                <h2>⚠️ Mission Alert: Fresh Intel Incoming</h2>
                <p>Agent,</p>
                <p>We've intercepted a new post transmission titled: <strong>${postTitle}</strong>.</p>
                <p>${postSummary}</p>

                <p style="font-size: 18px;">
                    <a href="https://www.g24sec.space/feed" style="text-decoration: none; background-color: #000; color: #0f0; padding: 12px 20px; border-radius: 6px;">📡 Join the Operation</a>
                </p>

                <p>This is your call to engage. Stay sharp. Stay connected.</p>
                <p>— G24Sec Command</p>
            </div>
        `,
    });

    for (const user of users) {
        try {
            const mailOptions = mailOptionsTemplate(user.email);
            const info = await transporter.sendMail(mailOptions);
            console.log(`Notification sent to ${user.email}:`, info.response);
        } catch (error) {
            console.error(`Failed to send to ${user.email}:`, error);
        }
    }
};