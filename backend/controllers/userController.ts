import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Task from '../models/Task';

interface UserBody {
  email: string;
  name: string;
  username?: string; // Changed from userID to username
  image?: string;
}

interface UserParams {
  id: string; // Represents either MongoDB ObjectID or username
}

export const getUser = async (req: TypedRequest<any, UserParams>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userID);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT user info
export const updateUser = async (req: TypedRequest<Partial<UserBody>, UserParams>, res: Response): Promise<void> => {
  try {
    const userId = req.params.userID;
    const updates = req.body;
    
    // Don't allow email changes through this endpoint to prevent security issues
    if (updates.email) {
      delete updates.email;
    }
    
    // Find user and update, returning the updated document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE user
export const deleteUser = async (req: TypedRequest<any, UserParams>, res: Response): Promise<void> => {
  try {
    const userID = req.params.userID;
      
    const deletedUser = await User.findByIdAndDelete(userID);
    
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserTasks = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userID })
      .populate('assignedBy', 'name')
      .sort({ deadline: 1 });
    
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};