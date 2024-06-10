import { Schema, Document, model } from "mongoose";

export interface IAuth {
    email: String,
    password: String,
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    photo: string;
    emailVerificationToken?: string;
    forgotPasswordToken?: string;
    forgotPasswordExpiry?: Date;
    token?: string;
}

const authSchema: Schema = new Schema<IAuth>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    photo: {
        type: String,
        default: ''
    },
    emailVerificationToken: {
        type: String,
        default:""
    },
    forgotPasswordToken: {
        type: String,
        default:""
    },
    forgotPasswordExpiry: {
        type: Date,
        default:""
    },
    token: {
        type: String
    }
},
    {
        timestamps: true,
    }
    );

export default model<IAuth>('Auth', authSchema)