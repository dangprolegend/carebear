import { Response } from 'express';
import Task from '../models/Task';
import { TypedRequest } from '../types/express';

interface TaskBody {
  groupID: string;        // Changed from groupId to group
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


// Create a new task
export const createTask = async (req: TypedRequest<TaskBody>, res: Response): Promise<void> => {
  try {
    const { groupID, assignedBy, assignedTo, description, deadline, priority } = req.body;
    
    const newTask = new Task({
      groupID,
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

// Get a specific task
export const getTask = async (req: TypedRequest<any, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskID);

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
      req.params.taskID,
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
      req.params.taskID,
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
    const task = await Task.findByIdAndDelete(req.params.taskID);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};