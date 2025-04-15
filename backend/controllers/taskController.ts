import { Response } from 'express';
import Task from '../models/Task';
import { TypedRequest } from '../types/express';
import { Types } from 'mongoose';

interface TaskBody {
  user: string;         // Changed from userId to user
  group: string;        // Changed from groupId to group
  assignedBy: string;
  assignedTo: string;
  description: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

interface TaskStatusBody {
  status: 'pending' | 'in-progress' | 'done';
}

interface TaskParams {
  id: string;
}

interface GroupTasks {
  id: string;  // Changed from group to id to match route parameter naming pattern
}

// Create a new task
export const createTask = async (req: TypedRequest<TaskBody>, res: Response): Promise<void> => {
  try {
    const { user, group, assignedBy, assignedTo, description, deadline, priority } = req.body;
    
    const newTask = new Task({
      user,
      group,
      assignedBy,
      assignedTo,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      priority
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tasks in a group
export const getGroupTasks = async (req: TypedRequest<any, GroupTasks>, res: Response): Promise<void> => {
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

// Get tasks assigned to a user
export const getUserTasks = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate('assignedBy')
      .populate('group')
      .sort({ deadline: 1 });
    
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific task
export const getTask = async (req: TypedRequest<any, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('group');
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
export const updateTask = async (req: TypedRequest<Partial<TaskBody>, TaskParams>, res: Response): Promise<void> => {
  try {
    // Handle date conversion if deadline is provided
    const updateData: Partial<{ [key: string]: any }> = { ...req.body };
    if (req.body.deadline) {
      updateData.deadline = new Date(req.body.deadline);
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update task status
export const updateTaskStatus = async (req: TypedRequest<TaskStatusBody, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a task
export const deleteTask = async (req: TypedRequest<any, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};