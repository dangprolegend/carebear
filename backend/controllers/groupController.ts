import { Response } from 'express';
import Group from '../models/Group';
import Member from '../models/Member';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';
import Task from '../models/Task';

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
export const createGroup = async (req: TypedRequest<CreateGroupBody>, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    console.log('Creating group with data:', { name });
    
    // Create the group
    const newGroup = new Group({ name });
    const savedGroup = await newGroup.save();
    
    console.log('Group saved successfully:', savedGroup);
    
    // Add the creator as an admin member
    const member = new Member({
      userID: req.params.userID,
      groupID: savedGroup._id,
      role: 'admin'
    });
    
    console.log('Creating member with data:', { userID: req.params.userID, groupID: savedGroup._id, role: 'admin' });
    
    await member.save();
    
    console.log('Member saved successfully');
    
    res.status(201).json(savedGroup);
  } catch (err: any) {
    console.error('Error creating group:', err);
    console.error('Error stack:', err.stack);
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