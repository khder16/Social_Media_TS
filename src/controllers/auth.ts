import { Request, Response, RequestHandler } from 'express';
import { addMinutes, getUnixTime, addYears } from 'date-fns';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import Auth from '../models/auth';
import User from '../models/user';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config()
import { ObjectId, Types } from 'mongoose';
// import cloudinary from 'cloudinary';
// import generateRefreshToken from '../config/refreshToken';




export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const isExisting = await Auth.findOne({ email: req.body.email })
        if (isExisting) {
            throw new Error("email already existing")
        }
        const token = jwt.sign(req.body.email, process.env.TOKEN_KEY as Secret);
        let password = await bcrypt.hash(req.body.password, 10)
        const newAuth = await Auth.create({ ...req.body, password, token })
        const newUser = await (await User.create({ userInfo: newAuth._id, email: newAuth.email })).populate("userInfo");
        let email = "khdrhabeb16@hotmail.com";
        emailVerification(email, token, newAuth._id);
        res.json({
            status: true,
            message: "success",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const login: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ msg: "Please provide email and password to login" });
        }
        let user = await Auth.findOne({ email });
        if (!user) {
            return res.status(500).json("Password or email may be incorrect");
        }
        if (user && (await bcrypt.compare(password.toString(), user?.password as string))) {
            if (user.emailVerified == false) {
                return res.status(500).json("Please verify your Email and try again");
            }
            console.log(`${user.firstName} Loged-in`);
            const token = jwt.sign({ email: user?.email }, process.env.TOKEN_KEY as Secret, { expiresIn: '10d' });

            // (req as any).user.token = token;

            res.cookie('token', token, { maxAge: 240 * 60 * 60 * 1000 });
            res.status(200).json("Loged in successfully");
        } else {
            return res.status(500).json("Password or email may be incorrect");
        }
    } catch (error) {
        console.log(error);

        res.status(500).json(error);
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.cookie('token', '');
        res.status(200).json({ message: "logout success" });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const forgotPasswordToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await Auth.findOne({ email: email });
        if (!user) {
            res.status(500).json("User not found.");
        }
        const token = jwt.sign({ email: user?.email }, process.env.TOKEN_KEY as Secret);
        const url = `localhost:3000/auth/resetpass/${token}`;
        const message = `Copy paste this link in your Url and hit enter \n\n ${url}`;
        const data = {
            to: email,
            subject: "Password reset",
            html: message,
        };
        sendEmail(data.to, data.subject, data.html);
        if (user?.token) { user.token = token; }
        user?.save();
        res.json("email has sent");
    } catch (error) {
        res.json(error);
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { password } = req.body;
        const { token } = req.params;
        const user = await Auth.findOne({ token: token });
        if (!user) {
            throw new Error("Token expired or invalid. Please try again.");
        }
        user.password = await bcrypt.hash(req.body.password, 10);
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save();
        res.json({ newPass: user.password });
    } catch (error) {
        res.status(500).json({ error: "There was an error while processing your request." });
    }
};

const emailVerification = async (email: string, token: string, id: Types.ObjectId): Promise<void> => {
    try {
        const message = `localhost:3000/auth/verify/${id}/${token}`;
        await sendEmail(email, "Verify Email", message);
    } catch (error) {
        throw new Error(error as string);
    }
};

export const checkVerifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await Auth.findOne({ _id: req.params.id });
        if (!user) res.status(400).send("Invalid link");
        const token = await Auth.findOne({ _id: user?._id, token: req.params.token });
        if (!token) res.status(400).send("Invalid link");
        const newUser = await Auth.findByIdAndUpdate({ _id: user?._id }, { emailVerified: true }, { new: true });
        res.status(200).json(newUser);
    } catch (error) {
        throw new Error(error as string);
    }
};

const createPasswordResetToken = async function (user: any): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

const sendEmail = async (email: string, subject: string, html: string): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.UG,
                pass: process.env.PG,
            },
        });
        await transporter.sendMail({ from: process.env.UG, to: email, subject: subject, html: html });
        console.log("Email sent successfully");
    } catch (error) {
        console.log("email not sent");
        console.log(error);
    }
};

export const allUsers = async (req: Request, res: Response) => {
    try {
        const allUser = await Auth.find({})

        return res.json(allUser)
    } catch (error) {
        throw new Error(error as string);
    }
}



export const OneUser = async (req: Request, res: Response) => {
    try {
        const Oneuser = await Auth.findOne({ email: req.body.email })
        return res.json(Oneuser)
        
    } catch (error) {
        console.log(error);
    }
}