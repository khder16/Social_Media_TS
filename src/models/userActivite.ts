import { Schema, Document, model } from "mongoose";

export interface IuserActivity {
    user_id: Schema.Types.ObjectId,
    post_id: Schema.Types.ObjectId,
    action: string,
    timestamp: Date
}



const UserActivity: Schema = new Schema<IuserActivity>({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    action: {
        type: String,
        enum: ["like", "comment", "recommend"],
        required: true
    },
    timestamp: { type: Date, default: Date.now },
})

export default model<IuserActivity>("UserActivity", UserActivity);