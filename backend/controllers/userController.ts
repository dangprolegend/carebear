//@ts-nocheck
import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Task from '../models/Task';
import Notification from '../models/Notification';
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

export const isUserAdminOfGroup = async (userID: string, groupID: string): Promise<boolean> => {
  try {
    const group = await Group.findById(groupID);
    if (!group) {
      return false;
    }

    // Check if user is a member with admin role
    const adminMember = group.members.find(
      (member) => member.user.toString() === userID && member.role === 'admin'
    );

    return !!adminMember;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const checkUserAdminStatus = async (req: any, res: any): Promise<void> => {
  try {
    const { userID, groupID } = req.params;

    if (!userID || !groupID) {
      res.status(400).json({ message: 'User ID and Group ID are required' });
      return;
    }

    const user = await User.findById(userID);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const group = await Group.findById(groupID);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    const isAdmin = await isUserAdminOfGroup(userID, groupID);

    const memberInfo = group.members.find(
      (member) => member.user.toString() === userID
    );

    if (!memberInfo) {
      res.status(200).json({
        isAdmin: false,
        isMember: false,
        message: 'User is not a member of this group'
      });
      return;
    }

    res.status(200).json({
      isAdmin,
      isMember: true,
      role: memberInfo.role,
      familialRelation: memberInfo.familialRelation || null,
      groupName: group.name
    });

  } catch (err: any) {
    console.error('Error checking admin status:', err);
    res.status(500).json({ error: err.message });
  }
};

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
    const { groupID: requestedGroupID } = req.query; // optional query parameter
    
    const user = await User.findById(userID).select('groupID additionalGroups');
    if (!user || !user.groupID) {
      res.status(404).json({ message: 'User or group not found' });
      return;
    }
    
    // Determine which group to use
    let targetGroupID = user.groupID; 
    
    if (requestedGroupID) {
      const userGroupIDs = [user.groupID.toString(), ...(user.additionalGroups || []).map((id: any) => id.toString())];
      
      if (userGroupIDs.includes(requestedGroupID as string)) {
        targetGroupID = requestedGroupID as string;
      } else {
        res.status(403).json({ message: 'User does not have access to the requested group' });
        return;
      }
    }

    const group = await Group.findById(targetGroupID).select('members');
    if (!group || !group.members) {
      res.status(404).json({ message: 'Group not found or has no members' });
      return;
    }

    // Filter out the current user and collect member info with role and familial relation
    const otherMembers = group.members.filter((member: any) => member.user.toString() !== userID);
    const memberUserIDs = otherMembers.map((member: any) => member.user.toString());
    const users = await User.find({ _id: { $in: memberUserIDs } }).select('firstName lastName imageURL');

    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });

    // Combine user info with role and familial relation from group members
    const familyMembers = otherMembers.map((member: any) => {
      const userInfo = userMap.get(member.user.toString());
      return {
        userID: member.user,
        fullName: userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : '',
        imageURL: userInfo?.imageURL || null,
        role: member.role,
        familialRelation: member.familialRelation || null,
      };
    });

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