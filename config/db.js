import mongoose from "mongoose";

const mongoURI = "mongodb+srv://ramborkar2006_db_user:E4euJaj8ScPqtXFA@cluster0.i1rc98c.mongodb.net/?appName=Cluster0";

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB error", err);
        process.exit(1);
    }
};

export default connectDB;