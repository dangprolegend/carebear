import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Task from '../models/Task';
import Notification from '../models/Notification';
import Dashboard from '../models/Dashboard';
import Group from '../models/Group';

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

// Get all groups for a user (main + additional)
export const getAllUserGroups = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    // Find the user - first without populating to check structure
    const user = await User.findById(userID);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize result arrays to store IDs and formatted groups
    const groupIDs: string[] = [];
    
    // First add the main groupID if it exists
    if (user.groupID) {
      groupIDs.push(user.groupID.toString());
    }

    // Then add any additional groups
    if (user.additionalGroups && Array.isArray(user.additionalGroups)) {
      for (const group of user.additionalGroups) {
        if (group && group.groupID) {
          groupIDs.push(group.groupID.toString());
        }
      }
    }

    // Fetch all group data in one query
    const groups = await Group.find({ _id: { $in: groupIDs } });
    
    // Format groups for the frontend
    const formattedGroups = groups.map((group: any) => ({
      id: group._id.toString(),
      name: group.name
    }));

    // Return a response with both the IDs and formatted group objects
    return res.status(200).json({
      groupIDs: groupIDs,
      groups: formattedGroups
    });
    
  } catch (error: any) {
    console.error('Error fetching all user groups:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch user groups',
      error: error.message 
    });
  }
};

// Get the groupID of a specific user
export const getUserGroup = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    const user = await User.findById(userID).select('groupID');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ 
      groupID: user.groupID 
    });
    
  } catch (error: any) {
    console.error('Error fetching user group:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch user group',
      error: error.message 
    });
  }
};

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


// Get full name and image URL of a user by userID
export const getUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).select('firstName lastName imageURL');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const imageURL = user.imageURL || null;
    res.status(200).json({ fullName, imageURL });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all family members of the group a user belongs to (excluding the user themselves)
export const getFamilyMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.params;

    // Get the user's groupID
    const user = await User.findById(userID).select('groupID');
    if (!user || !user.groupID) {
      res.status(404).json({ message: 'User or group not found' });
      return;
    }

    // Get the group and its members array
    const group = await Group.findById(user.groupID).select('members');
    if (!group || !group.members) {
      res.status(404).json({ message: 'Group not found or has no members' });
      return;
    }

    // Collect userIDs of all members except the user themselves
    const memberUserIDs = group.members
      .map((member: any) => member.user.toString())
      .filter((id: string) => id !== userID);

    // Fetch user info for each member
    const members = await User.find({ _id: { $in: memberUserIDs } }).select('firstName lastName imageURL');
    const familyMembers = members.map(member => ({
      userID: member._id,
      fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      imageURL: member.imageURL || null,
    }));

    res.status(200).json(familyMembers);
  } catch (error: any) {
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