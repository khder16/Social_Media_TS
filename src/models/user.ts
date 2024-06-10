import { Schema, model } from "mongoose";
import Story from "../models/stories";


interface IExperience {
    position: string;
    company: string;
    location: string;
    summary: string;
}


interface IEducation {
    schoolName: string;
    course: string;
    summary: string;
}

interface IStory {
    storyType: "text" | "photo" | "video";
    content?: string;
    mediaUrl?: string;
    expiration: Date;
}

interface IPreferredPosition {
    position: string;
    years: number;
}

interface IUser {
    userInfo: Schema.Types.ObjectId;
    jobTitle?: string;
    about?: string;
    connections: string[];
    location?: string;
    experience: IExperience[];
    education: IEducation[];
    skills: string[];
    preferredPositions: IPreferredPosition[];
    bookmarkedPosts: string[];
    email: string;
    stories: IStory[];
}

const userSchema: Schema = new Schema<IUser>(
    {
        userInfo: {
            type: Schema.Types.ObjectId,
            ref: 'Auth',
            required: true
        },
        jobTitle: {
            type: String
        },
        about: {
            type: String
        },
        connections: {
            type: [String],
            default: []
        },
        location: String,
        experience: [
            {
                position: {
                    type: String
                },
                company: {
                    type: String
                },
                location: {
                    type: String
                },
                summary: {
                    type: String
                }
            }
        ],
        education: [
            {
                schoolName: {
                    type: String
                },
                course: {
                    type: String
                },
                summary: {
                    type: String
                }
            }
        ],
        skills: {
            type: [String],
            default: []
        },
        preferredPositions: [
            {
                position: {
                    type: String
                },
                years: {
                    type: Number
                }
            }
        ],
        bookmarkedPosts: {
            type: [String],
            default: []
        },
        email: {
            type: String,
            unique: true,
            sparse: true
        },
            stories: [{
                storyType: { type: String, required: true },
                content: { type: String, required: true },
                mediaUrl: { type: String, required: true },
                expiration: { type: Date, required: true }
            }]
        },
    { timestamps: true }
);


userSchema.index({ 'stories.expiration': 1 }, { expireAfterSeconds: 24 * 60 * 60 })
export default model<IUser>("User", userSchema);