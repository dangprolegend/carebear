//@ts-nocheck
import { Response } from 'express';
import Group from '../models/Group';
import Member from '../models/Member';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import User from '../models/User';

interface GroupBody {
  name: string;
}

interface GroupParams {
  id: string;
}

interface CreateGroupBody extends GroupBody {
  user: string;
}

// Create a new group
export const createGroup = async (req: TypedRequest<{ name: string; userID: string }>, res: Response): Promise<void> => {
  try {
    const { userID } = req.params
    const { name } = req.body;

    // Create the group with the user as the admin
    const newGroup = new Group({
      name,
      numberOfMembers: 1,
      members: [{ user: userID, role: 'admin' }],
    });

    const savedGroup = await newGroup.save();

    // Update the user's groupID
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { $set: { groupID: savedGroup._id } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(201).json({
      message: 'Group created successfully',
      group: savedGroup,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all groups
// Done migration
export const getAllGroups = async (req: TypedRequest, res: Response): Promise<void> => {
  try {
    const groups = await Group.find().exec();
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific group
// Done migration
export const getGroup = async (req: TypedRequest<any, GroupParams>, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.groupID);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    res.json(group);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update a group
// Done migrate
export const updateGroup = async (req: TypedRequest<GroupBody, GroupParams>, res: Response): Promise<void> => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.groupID,
      { name: req.body.name },
      { new: true }
    );
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    res.json(group);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a group
// Done migration
export const deleteGroup = async (req: TypedRequest<any, GroupParams>, res: Response): Promise<void> => {
  try {
    const group = await Group.findByIdAndDelete(req.params.groupID);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Delete all associated members
    await Member.deleteMany({ group: req.params.groupID });
    
    res.json({ message: 'Group deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get all groups for a user
// Done migration
export const getUserGroups = async (req: TypedRequest<any, { userID: string }>, res: Response): Promise<void> => {
  try {
    const userID = new mongoose.Types.ObjectId(req.params.userID);
    const members = await Member.find({userID: userID}).populate('groupID').exec()
    const groups = members.map(member => member.groupID);
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Added: Get all members of a group
export const getGroupMembers = async (req: TypedRequest<any, GroupParams>, res: Response): Promise<void> => {
  const { groupID } = req.params;
    if (!groupID) {
        res.status(400).json({ message: "Group ID is required" });
        return;
    }

    try {
        const members = await Member.find({ groupID: groupID })
                                    .populate('userID', 'name email');
        if (!members) {
            res.status(404).json({ message: "Members not found" });
            return;
        }
        res.status(200).json(members);
    } catch (error: any) {
        console.error("Error in fetching group members", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all tasks in a group
export const getGroupTasks = async (req: TypedRequest<any, GroupParams>, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ group: req.params.id })
      .populate('assignedTo')
      .populate('assignedBy')
      .sort({ deadline: 1 });
    
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Join a group
export const joinGroup = async (req: any, res: any): Promise<void> => {
  try {
    const { groupID } = req.body;
    const { userID } = req.params;
    
    // Find the group
    const group = await Group.findById(groupID);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if the user is already in the group
    const isMember = group.members.some((member) => member.user.toString() === userID);
    if (isMember) {
      res.status(400).json({ message: 'User is already a member of the group' });
      return;
    }

    // Determine the role (default to caregiver for now)
    const role = 'caregiver'; // This can be updated later based on additional logic

    // Add the user to the group's members array
    group.members.push({ user: userID, role });
    group.numberOfMembers += 1;

    const updatedGroup = await group.save();

    // Update the user's groupID
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { $set: { groupID: groupID } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'User joined the group successfully',
      group: updatedGroup,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('Error joining group:', err);
    res.status(500).json({ error: err.message });
  }
};