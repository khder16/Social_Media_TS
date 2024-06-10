import express, { Application, RequestHandler } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import connectDB from './db/db';
import path from 'path'
import cookieParser from 'cookie-parser';
import auth from './routers/authRout';
import post from './routers/postRout';
import users from './routers/userRout';
import comment from './routers/comments';
import morgan from 'morgan';
import cors from "cors"
import helmet from "helmet"
import http from 'http';
const { CronJob } = require('cron');
import { userJoin, userLeave, getRoomUser, getCurrentUser } from './controllers/user';
import { formatMessage } from './utils/message'
import { Server, Socket } from 'socket.io';
export const app: Application = express();
export const server = http.createServer(app);
export const io = new Server(server);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }) as RequestHandler);
app.use(express.json() as RequestHandler);
app.use(cookieParser());
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))
dotenv.config();
app.use(express.static(path.join(__dirname, '../public')));
const PORT: number = 3000;

app.use('/auth', auth);
app.use('/post', post);
app.use('/comment', comment);
app.use('/users', users);



io.on('connection', socket => {


    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        socket.emit('message', formatMessage(`${user.username} `, 'Welcome to ChatCord'))


        // Broadcast when a user connects

        socket.broadcast.to(user.room).emit('message', formatMessage('chat ', `${username} has joined the chat`))


        // users and room information

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUser(user.room)
        })

    })




    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg))
        }
    })

    // When client disconnect
    socket.on('disconnect', () => {

        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(`${user.username}`, `${user.username} has left the chat`))

            // users and room information

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUser(user.room)
            })
            // window.location.href = '/'
            socket.disconnect(true);
        }

    })
})

const start = async (): Promise<void> => {
    try {
        server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}...`));
        await connectDB(process.env.MONGO_URI as string);
    } catch (error) {
        console.log(error);
    }
};

start()