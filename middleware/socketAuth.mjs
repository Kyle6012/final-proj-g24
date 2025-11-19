import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookie from 'cookie';

dotenv.config();

export const socketAuth = async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.userToken;
    //console.log("User token recieved: ", token);
    if(!token) return next(new Error("Authantication error"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = { id: decoded.id, username: decoded.username };
        next();
    } catch (e) {
        next(new Error("Authentication error"));
    }
};