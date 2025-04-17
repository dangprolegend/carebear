import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use MongoDB Atlas connection string from .env file
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carebear';

const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    console.log('\nTroubleshooting MongoDB connection:');
    console.log('- Make sure you\'ve replaced <db_password> with your actual database password in .env');
    console.log('- Verify your IP is whitelisted in MongoDB Atlas Network Access');
    console.log('- Check if the cluster name is correct');
    process.exit(1); // Exit with failure
  }
};

export default connectDB;