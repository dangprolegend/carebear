import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';

interface UserBody {
  email: string;
  name: string;
  username?: string; // Changed from userID to username
  image?: string;
}

interface UserParams {
  id: string; // Represents either MongoDB ObjectID or username
}

// POST /auth/signup
export const signup = async (req: TypedRequest<UserBody>, res: Response): Promise<void> => {
    const { email, name, username } = req.body;
    
    try {
      // Check if user already exists by email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }
      
      // Create new user (username will be auto-generated if not provided)
      const newUser = new User({ email, name, username });
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
  