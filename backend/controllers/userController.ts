import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';

interface UserBody {
  email: string;
  name: string;
  username?: string; // Changed from userID to username
  image?: string;
}

interface UserParams {
  id: string; // Represents either MongoDB ObjectID or username
}

// GET user by ID (MongoDB ObjectID) or username (string)
export const getUser = async (req: TypedRequest<any, UserParams>, res: Response): Promise<void> => {
  try {
    let user;
    
    // Try to find by MongoDB ObjectID first
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    }
    
    // If not found or not a valid ObjectID, try to find by username
    if (!user) {
      user = await User.findOne({ username: req.params.id });
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/signup
export const signup = async (req: TypedRequest<UserBody>, res: Response): Promise<void> => {
  const { email, name, image, username } = req.body;
  
  try {
    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }
    
    // Create new user (username will be auto-generated if not provided)
    const newUser = new User({ email, name, image, username });
    await newUser.save();
    
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/login
export const login = async (req: TypedRequest<Partial<UserBody>>, res: Response): Promise<void> => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }
  
  try {
    // Try to find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT user info
export const updateUser = async (req: TypedRequest<Partial<UserBody>, UserParams>, res: Response): Promise<void> => {
  try {
    let user;
    
    // Try to update by MongoDB ObjectID first
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
    }
    
    // If not found or not a valid ObjectID, try to update by username
    if (!user) {
      user = await User.findOneAndUpdate(
        { username: req.params.id },
        { $set: req.body },
        { new: true }
      );
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE user
export const deleteUser = async (req: TypedRequest<any, UserParams>, res: Response): Promise<void> => {
  try {
    let result;
    
    // Try to delete by MongoDB ObjectID first
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      result = await User.findByIdAndDelete(req.params.id);
    }
    
    // If not found or not a valid ObjectID, try to delete by username
    if (!result) {
      result = await User.findOneAndDelete({ username: req.params.id });
    }
    
    if (!result) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};