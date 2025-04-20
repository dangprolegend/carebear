import { Response } from 'express';
import Member from '../models/Member';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Group from '../models/Group';

interface MemberBody {
  userID: string;  // Changed from userID to user
  groupID: string;  // Changed from groupID to group
  role: 'admin' | 'caregiver' | 'carereceiver';
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
    
    // Check if already a member
    const existingMember = await Member.findOne({ userID, groupID });
    if (existingMember) {
        res.status(400).json({ message: 'User is already a member of this group' });
        return;
    }

    // Add member to family group
    const newMember = new Member({ userID, groupID, role });
    await newMember.save();
    res.status(201).json(newMember);
} catch (error: any) {
    console.error("Error in adding member", error.message);
    res.status(400).json({ success: false, error: error.message });
}
};



// Update a member's role
export const updateMember = async (req: TypedRequest<{ role: 'admin' | 'caregiver' | 'carereceiver' }, MemberParams>, res: Response): Promise<void> => {
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
      const result = await Member.findOneAndDelete({ 
          userID: userID, 
          groupID: groupID 
      });
  
      if (!result) {
          res.status(404).json({ success: false, message: "Member not found in this group" });
          return;
      }
  
      res.status(200).json({ success: true, message: "Member removed successfully"});
  } catch (error: any) {
      console.error("Error removing member from group:", error.message);
      res.status(500).json({ success: false, error: error.message });
  }
};