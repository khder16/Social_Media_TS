import { Request, Response } from 'express';
import User from '../models/user';
import Post from '../models/post';
import Comment from '../models/comments';
import UserActivity from '../models/userActivite';


export const createComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user = await User.findOne((req as any).user.id);
        const createdComment = await Comment.create({ ...req.body, user: (req as any).user?.id, post: req.params.postId, userInfo: user?.userInfo });
        const post = await Post.findById(req.params.postId);
        console.log(post);

        post?.comments.push(createdComment._id);
        await post?.save();

        const comments = await Comment.find({ post: createdComment.post }).populate("userInfo");
        const userActivity = await UserActivity.create({
            user_id: user?._id,
            post_id: post?._id,
            action: 'comment',
            timestamp: new Date()
        });

        return res.status(201).json(comments);
    } catch (error) {
        return res.status(500).json(error as string);
    }
}

export const getPostComments = async (req: Request, res: Response): Promise<Response> => {
    try {
        const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 }).populate('userInfo');
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json(error as string);
    }
}

export const getOneComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const comment = await Comment.findById(req.params.commentId).populate('userInfo');
        if (!comment) {
            return res.status(400).json({ msg: "No such comment" });
        }
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json(error as string);
    }
}

export const updateComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(400).json({ msg: "No such comment" });
        }

        if (comment.user.toString() === (req as any).user?.id.toString()) {
            comment.commentText = req.body.commentText;
            await comment.save();
            return res.status(200).json(comment);
        } else {
            return res.status(400).json({ msg: "You can update only your own comments" });
        }
    } catch (error) {
        return res.status(500).json(error as any);
    }
}
export const deleteComment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(400).json({ msg: "No such comment" });
        }
        if (comment.user.toString() === (req as any).user.id.toString()) {
            const deletedComment = await Comment.findByIdAndDelete(req.params.commentId);
            return res.status(200).json({ msg: "Comment has been successfully deleted" });
        } else {
            return res.status(400).json({ msg: "You can delete only your own comments" });
        }
    } catch (error) {
        return res.status(500).json(error as string);
    }
}

export const toggleCommentLike = async (req: Request, res: Response): Promise<Response> => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(400).json({ msg: "User ID not found" });
        }
        if (!comment) {
            return res.status(400).json({ msg: "No such comment" });
        }
        if (comment.user.toString() !== (req as any).user?.id.toString()) {
            if (!comment.likes.includes(userId)) {
                comment.likes.push(userId);
                await comment.save();
                return res.status(200).json({ comment, msg: "Comment has been successfully liked!" });
            } else {
                comment.likes = comment.likes.filter((id) => id !== userId);
                await comment.save();
                return res.status(200).json({ comment, msg: "Comment has been successfully unliked" });
            }
        } else {
            return res.status(400).json({ msg: "You cannot like your own comment" });
        }
    } catch (error) {
        return res.status(500).json(error as string);
    }
}

