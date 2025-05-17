"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use MongoDB Atlas connection string from .env file
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carebear';
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.log('\nTroubleshooting MongoDB connection:');
        console.log('- Make sure you\'ve replaced <db_password> with your actual database password in .env');
        console.log('- Verify your IP is whitelisted in MongoDB Atlas Network Access');
        console.log('- Check if the cluster name is correct');
        process.exit(1); // Exit with failure
    }
};
exports.default = connectDB;
