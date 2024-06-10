import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { config } from 'process';
import cookieParser from 'cookie-parser';
import Auth, { IAuth } from '../models/auth';
import { ObjectId, Types } from 'mongoose';
import User from '../models/user';
import * as dotenv from 'dotenv'
dotenv.config()

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.token || req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            res.status(403).send("A token is required for authentication");
        }

        const decoded = jwt.verify(token, process.env.TOKEN_KEY as Secret) as JwtPayload;

        const user = await Auth.findOne({ email: decoded.email });

        if (user) {
            (req as any).user = {
                id: user.id,
                token: decoded.token
            };
            next();
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).send("Unauthorized");
    }
}