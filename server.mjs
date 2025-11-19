import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
import { socketAuth } from './middleware/socketAuth.mjs';   
import messageRoutes from './routes/messageRoutes.mjs'; 
import notificationRoutes from './routes/notificationRoutes.mjs';
import communityRoutes from './routes/communityRoutes.mjs';
import './models/Post.mjs';
import './models/User.mjs'; 
import './models/Message.mjs'; 
import './models/Like.mjs';
import './models/Comment.mjs';
import './models/associations.mjs';
import axiosRetry  from 'axios-retry';
import axios from 'axios';
import initSocket from './controllers/socket.mjs';
import { splashScreen } from './middleware/splash.mjs';
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });


dotenv.config();

const app = express();

// using http for the moment 
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true // cookies are sent
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Parse application/json data
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(flash());
app.use(splashScreen);
io.use(socketAuth);
initSocket(io);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "supertestsecret789",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.NODE_ENV === 'development' }, 
    })
);

passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.io = io; // socket available for all controllers
    next();
});

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

app.use((req, res) => {
    res.status(404).render('error', { message: "Page not found" });
});

initCronJob();

const PORT = process.env.PORT || 3000;

sqz.sync({ alter: true }).then(() => {
    server.listen(PORT, () => {
        console.log(`Server live on port ${PORT}`);
    });
});

