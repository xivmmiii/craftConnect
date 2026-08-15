import mongoose from "mongoose";

const connectDB = async (app) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connection with MongoDB is successful");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectDB;
