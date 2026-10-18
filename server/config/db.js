
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.error("❌ MONGODB_URI is not defined in .env");
            process.exit(1);
        }

        mongoose.set("bufferCommands", false);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
