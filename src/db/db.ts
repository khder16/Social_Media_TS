import mongoose, { connect } from "mongoose";


const connectDB = async (url: string): Promise<void> => {
    await mongoose.connect(url);
    console.log('Connected To DB Successfully');
}

export default connectDB