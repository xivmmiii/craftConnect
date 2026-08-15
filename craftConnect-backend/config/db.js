import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connection with MongoDB is successful");
};

export default connectDB;
