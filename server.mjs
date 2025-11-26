import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import sqz from './config/db.mjs';
import passportConfig from './config/passport.mjs';
import homeRoutes from './routes/homeRoutes.mjs';
import authRoutes from './routes/authRoutes.mjs';
import postRoutes from './routes/postRoutes.mjs';
import commentRoutes from './routes/commentRoutes.mjs';
import profileRoutes from './routes/profileRoutes.mjs';
import followRoutes from './routes/followRoutes.mjs';
import searchRoutes from './routes/searchRoutes.mjs';
import flash from 'connect-flash';
import { initCronJob } from './cronJobs.mjs';
import adminRoutes from './routes/adminRoutes.mjs';
import aiRoutes from './routes/aiRoutes.mjs';
import messageRoutes from './routes/messageRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import communityRoutes from './routes/communityRoutes.mjs';
import cronRoutes from './routes/cronRoutes.mjs';
import './models/Post.mjs';
import './models/User.mjs';
import './models/Message.mjs';
import './models/Like.mjs';
import './models/Comment.mjs';
import './models/associations.mjs';
import axiosRetry from 'axios-retry';
import axios from 'axios';
import { splashScreen } from './middleware/splash.mjs';
import connectPgSimple from 'connect-pg-simple';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

dotenv.config();

const app = express();
const PgSession = connectPgSimple(session);

// using http for the moment 
const server = createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Parse application/json data
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(flash());
app.use(splashScreen);

app.use(
    session({
        store: new PgSession({
            conObject: {
                connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
                ssl: { rejectUnauthorized: false }
            },
            tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET || "supertestsecret789",
        resave: false,
        saveUninitialized: false, // Recommended for connect-pg-simple
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        },
    })
);

passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/feed', postRoutes);
app.use('/comments', commentRoutes);
app.use('/profile', profileRoutes);
app.use('/user', followRoutes);
app.use('/search', searchRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);
app.use('/user', messageRoutes);
app.use('/notifications', notificationRoutes);
app.use('/communities', communityRoutes);
app.use('/api/cron', cronRoutes);

app.use((req, res) => {
    res.status(404).render('error', { message: "Page not found" });
});

// Initialize cron jobs (only for local/long-running server)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CRON === 'true') {
    initCronJob();
}

const PORT = process.env.PORT || 3000;

// Only start listening if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    sqz.sync({ alter: true }).then(() => {
        server.listen(PORT, () => {
            console.log(`Server live on port ${PORT}`);
        });
    });
}

export default app;

