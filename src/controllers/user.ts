import { Request, Response } from 'express';
import { Schema, Types, Document } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import multer, { Multer } from 'multer';
import multerUploads from '../middleware/multer';
import User from '../models/user'
import Post from '../models/post';
import Auth from '../models/auth';

interface IUser extends Document {
    userInfo: Types.ObjectId;
    jobTitle?: string;
    about?: string;
    connections: string[];
}

interface IPost extends Document {
    user: Types.ObjectId;
}








export const getUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ userInfo: userId }).populate('userInfo');
        if (user) {
            const connections = await Promise.all(
                user.connections.map((con: string) => User.findById(con).populate('userInfo'))
            );


            const posts = await Post.find({ user: userId }).populate('userInfo');
            const numOfConnections = connections.length;
            const numOfPosts = posts.length;

            res.status(200).json({
                posts,
                numOfPosts,
                numOfConnections,
                connections,
                user
            });
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getUserConnections = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ userInfo: userId }).populate('userInfo');
        const connectionsUser = user?.connections.map((email: string) => email);
        res.status(200).json(connectionsUser);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const addRemoveConnection = async (req: Request, res: Response) => {
    try {
        const { userId, connectionId } = req.body;

        if (userId === connectionId) {
            throw new Error("You can't follow yourself");
        }

        const user = await User.findOne({ userInfo: userId }).populate('userInfo');
        const connection = await User.findOne({ userInfo: connectionId }).populate('userInfo');


        if (!user) {
            throw new Error("User not found");
        }

        if (connection) {
            if (user.connections.includes(connection.email)) {
                user.connections = user.connections.filter((con: string) => con !== connection.email);
            } else {
                user.connections.push(connection.email);
            }

            await user.save();
            const newUser = await User.findOne({ userInfo: userId }).populate('userInfo');
            res.status(200).json(newUser);
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.body.id;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getSuggestedConnections = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ userInfo: (req as any).user?.id }).populate('userInfo');
        const connectedUsers = user?.connections.map((conn: string) => conn);
        const suggestedUsers = await User.find({
            email: { $nin: connectedUsers, $ne: user?.email }
        }).populate('userInfo');
        res.status(200).json({ suggestedUsers });
    } catch (error) {
        res.status(500).json(error);
    }
}



// Configuration 


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_CLOUD_KEY,
    api_secret: process.env.API_CLOUD_SECR
});
const storage = multer.diskStorage({});
const upload = multer({ storage });

export const uploadImage = async (req: Request, res: Response) => {
    try {

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path)
            return res.json({ imageUrl: result })
        }
        console.log("upload");
        
    } catch (error) {
        return console.error('Error uploading image:', error);
    }
}

// Add Storie as Text or Photo or Video

export const addStory = async (req: Request, res: Response) => {
    const storyType = req.body.type;
    const content = req.body.content;
    const mediaUrl = req.body.mediaUrl;
    const userInfo = req.params.id
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const user = await User.findById({ userInfo })
    user?.stories.push({ storyType, content, mediaUrl, expiration })
    await user?.save()
}


export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Change Auth model to your actual model
        const authors = await Auth.find({});
        res.json(authors);
    } catch (error) {
        res.status(500).json(error);
    }
}





