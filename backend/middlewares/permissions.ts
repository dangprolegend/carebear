import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/models';
import { UserRequest } from '../types/express';
import User from '../models/User';
import Group from '../models/Group';
import Task from '../models/Task';

// Helper to get user's id as string
const getUserIdString = (user: any) => (user._id ? user._id.toString() : user.id ? user.id.toString() : undefined);

// Helper to get user's role in a group
const getUserRoleInGroup = async (userId: any, groupId: any) => {
  const group = await Group.findById(groupId);
  if (!group) return null;
  const member = group.members.find((m: any) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Function to compare MongoDB ObjectIds
const isSameObjectId = (id1: any, id2: any): boolean => {
  if (!id1 || !id2) return false;
  return String(id1) === String(id2);
};

// Check if user has admin privileges in the group
export const isAdmin = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const { groupID } = req.params;
    const user = req.user;
    const userId = user && getUserIdString(user);
    if (!userId || !groupID) {
      return res.status(403).json({ message: 'Access denied: User or Group not found' });
    }
    const role = await getUserRoleInGroup(userId, groupID);
    if (role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admin required for this group' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user can create and manage tasks (admin or caregiver in group)
export const canManageTasks = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { groupID } = req.body;
    const userId = user && getUserIdString(user);
    if (!userId || !groupID) {
      return res.status(403).json({ message: 'Access denied: User or Group not found' });
    }
    const role = await getUserRoleInGroup(userId, groupID);
    if (role === 'admin' || role === 'caregiver') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Only Admins and Caregivers can create tasks' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user can assign tasks to specific users
export const canAssignTask = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { groupID } = req.body;
    const userId = user && getUserIdString(user);
    if (!userId || !groupID) {
      return res.status(403).json({ message: 'Cannot assign tasks' });
    }
    const role = await getUserRoleInGroup(userId, groupID);
    if (role === 'admin') {
      return next();
    }
    if (role === 'caregiver') {
      const assigneeId = req.body.assignedTo;
      const assigneeRole = await getUserRoleInGroup(assigneeId, groupID);
      if (assigneeRole === 'carereceiver' || assigneeId.toString() === userId) {
        return next();
      }
    }
    return res.status(403).json({ message: 'Cannot assign tasks to this user' });
  } catch (error) {
    console.error('Error in canAssignTask middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if the user is the owner of the requested resource or an admin
export const isOwnerOrAdmin = (paramName: string) => {
  return async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const resourceId = req.params[paramName];
      const { groupID } = req.body;
      const userId = user && getUserIdString(user);
      if (!userId) {
        return res.status(403).json({ message: 'Access denied: User not found' });
      }
      const role = await getUserRoleInGroup(userId, groupID);
      if (role === 'admin' || isSameObjectId(userId, resourceId)) {
        return next();
      }
      return res.status(403).json({ message: 'Access denied for this resource' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

// Check if the user has permission for a specific task
export const hasTaskPermission = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const taskID = req.params.taskID;
    const userId = user && getUserIdString(user);
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const task = await Task.findById(taskID);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const groupID = task.group;
    const role = await getUserRoleInGroup(userId, groupID);
    if (role === 'admin') {
      return next();
    }
    if (role === 'caregiver' && (isSameObjectId(task.assignedBy, userId) || isSameObjectId(task.assignedTo, userId))) {
      return next();
    }
    if (role === 'carereceiver' && isSameObjectId(task.assignedTo, userId)) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Not authorized for this task' });
  } catch (error) {
    console.error('Error in hasTaskPermission middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user can manage a specific task (for update and delete operations)
export const canManageSpecificTask = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const taskID = req.params.taskID;
    const userId = user && getUserIdString(user);
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const task = await Task.findById(taskID);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const groupID = task.group;
    const role = await getUserRoleInGroup(userId, groupID);
    if (role === 'admin') {
      return next();
    }
    if (role === 'caregiver' && isSameObjectId(task.assignedBy, userId)) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Not authorized to manage this task' });
  } catch (error) {
    console.error('Error in canManageSpecificTask middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
