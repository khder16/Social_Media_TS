import { Schema, Document, model } from "mongoose";

export interface IPost extends Document {
    user: Schema.Types.ObjectId;
    userInfo: Schema.Types.ObjectId;
    title: string;
    photo: string;
    likes: string[];
    liked: boolean;
    comments: string[];
    location: string;
}

const PostSchema: Schema = new Schema<IPost>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userInfo: {
            type: Schema.Types.ObjectId,
            ref: 'Auth',
            required: true,
        },
        title: {
            type: String,
            required: true,
            minlength: 4,
        },
        photo: {
            type: String,
            default: '',
        },
        likes: {
            type: [String],
            default: [],
        },
        liked: {
            type: Boolean,
            default: false,
        },
        comments: {
            type: [String],
            default: [],
        },
        location: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

export default model<IPost>('Post', PostSchema);

