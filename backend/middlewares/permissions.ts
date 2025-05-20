import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/models';
import { UserRequest } from '../types/express';
import User from '../models/User';
import Task from '../models/Task';
import Group from '../models/Group';

/**
 * Function to compare MongoDB ObjectIds
 */
const isSameObjectId = (id1: any, id2: any): boolean => {
  if (!id1 || !id2) return false;
  return String(id1) === String(id2);
};

// Check if user has admin privileges in the Group
export const isAdmin = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const { groupID } = req.params;
    
    if (!user || !groupID) {
      return res.status(403).json({ message: 'Access denied: User or Group not found' });
    }
    
    // Find the group and check if the user is a member with admin role
    const group = await Group.findOne({
      _id: groupID,
      'members.user': user._id,
      'members.role': 'admin'
    });
    if (group) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admin required' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user can create and manage tasks (only admin can create tasks)
export const canManageTasks = (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (user && (user.role === 'admin' || user.role === 'caregiver')) {
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
    
    // Only admins and caregivers can assign tasks
    if (!user || (user.role !== 'admin' && user.role !== 'caregiver')) {
      return res.status(403).json({ message: 'Cannot assign tasks' });
    }

    const assigneeId = req.body.assignedTo;
    
    // Admins can assign to anyone
    if (user.role === 'admin') {
      return next();
    }
    
    // Caregivers can only assign to Carereceivers or themselves
    if (user.role === 'caregiver') {
      const assignee = await User.findById(assigneeId);
      if (!assignee) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      
      if (assignee.role === 'carereceiver' || isSameObjectId(assignee._id, user._id)) {
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
  return (req: UserRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const resourceId = req.params[paramName];
      
      if (user && (user.role === 'admin' || isSameObjectId(user._id, resourceId))) {
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
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Fetch the task to check permissions
    const task = await Task.findById(taskID);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Admins have full access
    if (user.role === 'admin') {
      return next();
    }

    // Caregivers can access tasks they created or that are assigned to them
    if (user.role === 'caregiver' && 
        (isSameObjectId(task.assignedBy, user._id) || isSameObjectId(task.assignedTo, user._id))) {
      return next();
    }
    
    // Carereceivers can only access tasks assigned to them
    if (user.role === 'carereceiver' && isSameObjectId(task.assignedTo, user._id)) {
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
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Admins can manage any task
    if (user.role === 'admin') {
      return next();
    }
    
    // Caregivers can only manage tasks they created
    if (user.role === 'caregiver') {
      const task = await Task.findById(taskID);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if the caregiver created this task
      if (isSameObjectId(task.assignedBy, user._id)) {
        return next();
      }
    }
    
    return res.status(403).json({ message: 'Access denied: Not authorized to manage this task' });
  } catch (error) {
    console.error('Error in canManageSpecificTask middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
