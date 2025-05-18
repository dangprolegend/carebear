import { Response } from 'express';
import Member from '../models/Member';
import mongoose from 'mongoose';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Group from '../models/Group';

interface MemberBody {
  userID: string;  // Changed from userID to user
  groupID: string;  // Changed from groupID to group
  role: 'bear_mom' | 'care_bear' | 'baby_bear'; // Role is stored in Group model's members array, not in Member model
}

interface MemberParams {
  id: string;
}

interface GroupMembersParams {
  id: string;  
}

// Add a member to a group
export const addMember = async (req: TypedRequest<MemberBody>, res: Response): Promise<void> => {
  try {
    const { groupID } = req.params;
    const { userID, role } = req.body;

    if (!userID || !role) {
        res.status(400).json({ message: "User ID and role fields are required" });
        return;
    }

    // Check if user exists
    const user = await User.findById(userID);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    
    // Check if group exists
    const group = await Group.findById(groupID);
    if (!group) {
        res.status(404).json({ message: 'Group not found' });
        return;
    }
    
    // Check if already a member in the Group
    const memberExists = group.members.some((member: { user: any; role: string }) => 
        member.user.toString() === userID);
    if (memberExists) {
        res.status(400).json({ message: 'User is already a member of this group' });
        return;
    }

    // Add member to family group
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Add member entry
        const newMember = new Member({ userID, groupID });
        await newMember.save({ session });
        
        // Update group's members array with the new member and role
        await Group.findByIdAndUpdate(
            groupID,
            { 
                $push: { members: { user: userID, role } },
                $inc: { numberOfMembers: 1 }
            },
            { session }
        );
        
        await session.commitTransaction();
        session.endSession();
        
        // Return the created member with role from the group
        res.status(201).json({
            member: newMember,
            role
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
  } catch (error: any) {
      console.error("Error in adding member", error.message);
      res.status(400).json({ success: false, error: error.message });
  }
};



// Update a member's role
export const updateMember = async (req: TypedRequest<{ role: 'bear_mom' | 'care_bear' | 'baby_bear' }, MemberParams>, res: Response): Promise<void> => {
  const { groupID, userID } = req.params;
  const { role } = req.body;

  if (!groupID || !userID || !role) {
      res.status(400).json({ 
          success: false, 
          message: "Group ID, User ID, and role fields are required" 
      });
      return;
  }

  try {
      const member = await Member.findOne({ 
          userID: userID, 
          groupID: groupID 
      });
  
      if (!member) {
          res.status(404).json({
          success: false,
          message: "Member not found in this group"
          });
          return;
      }
  
      member.role = role;
      await member.save();
  
      res.status(200).json({ success: true, data: "Role updated successfully" });
  } catch (error: any) {
      console.error("Error updating member role:", error.message);
      res.status(500).json({ success: false, error: error.message });
  }
};

// Remove a member from a group
export const removeMember = async (req: TypedRequest<any, MemberParams>, res: Response): Promise<void> => {
  const { groupID, userID } = req.params;
  
  if (!groupID || !userID) {
      res.status(400).json({ success: false, message: "Group ID and User ID fields are required" });
      return;
  }

  try {
    // Create a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Add member entry
        const newMember = new Member({ userID, groupID });
        await newMember.save({ session });
        
        // Update group's members array with the new member and role
        await Group.findByIdAndUpdate(
            groupID,
            { 
                $push: { members: { user: userID, role } },
                $inc: { numberOfMembers: 1 }
            },
            { session }
        );
        
        await session.commitTransaction();
        session.endSession();
        
        // Return the created member with role from the group
        res.status(201).json({
            member: newMember,
            role
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    };
  } catch (error: any) {
      console.error("Error removing member from group:", error.message);
      res.status(500).json({ success: false, error: error.message });
  }
};
