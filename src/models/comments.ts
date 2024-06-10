import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    userInfo: mongoose.Types.ObjectId;
    commentText: string;
    likes: string[];
}

const commentSchema: Schema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userInfo: {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    commentText: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment
