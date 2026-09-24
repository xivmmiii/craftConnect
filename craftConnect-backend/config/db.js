import mongoose from "mongoose";

let transactionsSupported = false;

export const supportsTransactions = () => transactionsSupported;

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connection with MongoDB is successful");

    // Transactions need a replica set or sharded cluster (Atlas is always one).
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    transactionsSupported = Boolean(hello.setName || hello.msg === "isdbgrid");
    if (!transactionsSupported)
        console.warn(
            "MongoDB is not a replica set: checkout will run without a transaction and roll back stock on failure.",
        );
};

export default connectDB;
