import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import memberRoutes from './routes/memberRoutes.js';

// Database connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', memberRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
