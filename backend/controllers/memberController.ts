import { Response } from 'express';
import Member from '../models/Member';
import User from '../models/User';
import { TypedRequest } from '../types/express';

interface MemberBody {
  user: string;  // Changed from userID to user
  group: string;  // Changed from groupID to group
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
    const { user, group, role } = req.body;
    
    // Check if member already exists
    const existingMember = await Member.findOne({ user, group });
    if (existingMember) {
      res.status(400).json({ message: 'User is already a member of this group' });
      return;
    }
    
    // Create new member
    const newMember = new Member({ user, group, role });
    await newMember.save();
    
    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get all members of a group
export const getGroupMembers = async (req: TypedRequest<any, GroupMembersParams>, res: Response): Promise<void> => {
  try {
    const members = await Member.find({ group: req.params.id }).populate('user');
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update a member's role
export const updateMember = async (req: TypedRequest<{ role: 'admin' | 'caregiver' | 'carereceiver' }, MemberParams>, res: Response): Promise<void> => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a member from a group
export const removeMember = async (req: TypedRequest<any, MemberParams>, res: Response): Promise<void> => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json({ message: 'Member removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get all groups that a user is a member of
export const getUserMemberships = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const memberships = await Member.find({ user: req.params.id }).populate('group');
    res.json(memberships);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};