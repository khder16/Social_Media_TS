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
import helmet from "helmet";
import http from 'http';
const { CronJob } = require('cron');

export const app: Application = express();
export const server = http.createServer(app);

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

const start = async (): Promise<void> => {
    try {
        server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}...`));
        await connectDB(process.env.MONGO_URI as string);
    } catch (error) {
        console.log(error);
    }
};

start()