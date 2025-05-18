import { Response } from 'express';
import Member from '../models/Member';
import mongoose from 'mongoose';
import User from '../models/User';
import { TypedRequest } from '../types/express';
import Group from '../models/Group';

interface MemberBody {
  userID: string;
  role: 'admin' | 'care_giver' | 'care_receiver'; // Role is stored in Group model's members array, not in Member model
}

interface MemberParams {
  id: string;
}

interface GroupMembersParams {
  id: string;
}

// Add a member to a group
export const addMember = async (req: TypedRequest<MemberBody, { groupID: string }>, res: Response): Promise<void> => {
  try {
    const { groupID } = req.params;
    const { userID, role } = req.body;

    if (!userID || !role) {
      res.status(400).json({ message: "User ID and role fields are required" });
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

    const memberExists = group.members.some(
      (member: { user: any }) => member.user.toString() === userID
    );
    if (memberExists) {
      res.status(400).json({ message: 'User is already a member of this group' });
      return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newMember = new Member({ userID, groupID });
      await newMember.save({ session });

      await Group.findByIdAndUpdate(
        groupID,
        {
          $push: { members: { user: userID, role } },
          $inc: { numberOfMembers: 1 }
        },
        { session }
      );

      await session.commitTransaction();
      res.status(201).json({ member: newMember, role });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Error in adding member", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a member's role
export const updateMember = async (
  req: TypedRequest<{ role: 'admin' | 'care_giver' | 'care_receiver' }, MemberParams>,
  res: Response
): Promise<void> => {
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove the member record
      await Member.deleteOne({ userID, groupID }, { session });

      // Remove from the group
      await Group.findByIdAndUpdate(
        groupID,
        {
          $pull: { members: { user: userID } },
          $inc: { numberOfMembers: -1 }
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Member removed successfully"
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error("Error removing member from group:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
