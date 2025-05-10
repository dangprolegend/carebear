import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Task from '../models/Task';
import Notification from '../models/Notification';
import Dashboard from '../models/Dashboard';

interface UserBody {
  email: string;
  name: string;
  username?: string; // Changed from userID to username
  image?: string;
}

interface UserParams {
  id: string; // Represents either MongoDB ObjectID or username
}

export const provideAdditionalUserInfo = async (req: any, res: any) => {
  try {
    const userID = req.params.userID;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      weight,
      height
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !weight || !height) {
      res.status(400).json({ message: 'Please fill out all fields to complete onboarding' });
      return;
    }

    // Find user and update onboarding data
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      {
        $set: {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          weight,
          height
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Additional info saved successfully',
      user: updatedUser
    });
  } catch (error: any) {}
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

export const getUserNotifications = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userID: req.params.userID })
      .populate('taskID', 'description')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Find user by clerkID
export const getUserIdByClerkId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkID } = req.params;

    if (!clerkID) {
      res.status(400).json({ message: 'clerkID is required' });
      return;
    }

    // Ensure clerkID is treated as a string
    const user = await User.findOne({ clerkID: String(clerkID) });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ userID: user._id });
  } catch (error: any) {
    console.error('Error fetching user by clerkID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get dashboard metrics for a user
// export const getUserMetrics = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
//   try {
//     // Tasks completed over time
//     const completedTasks = await Task.find({
//       assignedTo: req.params.userID,
//       status: 'done'
//     }).sort({ updatedAt: 1 });
    
//     // Get all dashboard entries for this user
//     const metrics = await Dashboard.find({ user: req.params.userID })
//       .populate('taskID', 'description')
//       .sort({ created_timestamp: -1 });
    
//     res.json({
//       completedTasks: completedTasks.length,
//       metrics
//     });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// };