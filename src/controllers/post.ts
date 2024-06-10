import { Request, Response, RequestHandler } from 'express'
import Post, { IPost } from '../models/post'
import Auth from '../models/auth'
import User from '../models/user'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_CLOUD_KEY,
    api_secret: process.env.API_CLOUD_SECR
});
export const createPost = async (req: Request, res: Response): Promise<Response> => {
    try {
        const file: any = (req as any).files
        let photoUrl: string | null = null

        if (file) {
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: 'posts',
            })
            photoUrl = result.secure_url
        }

        const user = await User.findOne({ userInfo: (req as any).user?.id })
        if (!user) {
            return res.status(400).json({ msg: "User not found" })
        }
        const posted: IPost = await Post.create({
            user: user?._id,
            title: req.body.title,
            userInfo: user?.userInfo,
            photo: photoUrl,
        })

        const posts = await Post.find().populate('user').sort({ createdAt: -1 })
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const getUserPosts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const posts = await Post.find({ user: req.params.id }).populate('userInfo')
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const getOnePost = async (req: Request, res: Response): Promise<Response> => {
    try {
        const post = await Post.findById(req.params.id).populate('userInfo')
        if (!post) {
            return res.status(400).json({ msg: 'No post found with this id' })
        }
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const updatePost = async (req: Request, res: Response): Promise<Response> => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({ error: 'Post not found' });
        }

        if (post.userInfo.toString() !== (req as any).user?.id.toString()) {
            return res.status(400).json({ error: 'You are not authorized to edit this post' });
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, req.body, { new: true });
        return res.status(200).json(updatedPost);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
export const deletePost = async (req: Request, res: Response): Promise<Response> => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(400).json({ msg: 'No such post' })
        }
        if (post?.userInfo.toString() === (req as any).user?.id.toString()) {
            await Post.findByIdAndDelete(req.params.id)
            return res.status(200).json({ msg: 'Post successfully deleted' })
        } else {
            return res.status(400).json({ msg: 'You can only delete your own posts' })
        }
    } catch (error) {
        return res.status(500).json(error as string)
    }
}



export const toggleLike = async (req: Request, res: Response): Promise<Response> => {
    try {
        const currentUserId = (req as any).user?.id
        if (!currentUserId) {
            return res.status(400).json({ error: 'Current user ID is undefined' });
        }

        const post = await Post.findById(req.params.id)
        if (!post) {
            res.status(400).json({ msg: 'Post not found' })
        }
        const isLiked = post?.likes.includes(currentUserId)
        if (isLiked && post?.likes) {
            post!.likes = post?.likes.filter((id) => id !== currentUserId)
            post!.liked = false
        } else {
            post?.likes.push(currentUserId)
            post!.liked = true
        }
        await post?.save()
        const message = isLiked ? 'Successfully unliked the post' : 'Successfully liked the post'
        return res.status(200).json({ post, msg: message })
    } catch (error) {
        return res.status(500).json(error as string)
    }
}


export const addProfilePhoto = async (req: Request, res: Response) => {
    try {

        const photo = req.body.photo;

        if (!photo) {
            return res.status(400).json({ message: "Please add a photo first" });
        }

        const uploadedPhoto = await cloudinary.uploader.upload(photo.path);
        const photoUrl = uploadedPhoto.secure_url;

        const user = await Auth.findByIdAndUpdate(req.params.id, { photo: photoUrl }, { new: true });

        if (user) {
            return res.status(200).json({ message: "The photo has been added successfully" });
        }
    } catch (error) {
        return res.status(500).json(error as string);
    }
}