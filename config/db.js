import mongoose from "mongoose";

const mongoURI = "mongodb+srv://jcha0270:fit3170@cluster0.1grk5zx.mongodb.net/fit3170db?retryWrites=true&w=majority";

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