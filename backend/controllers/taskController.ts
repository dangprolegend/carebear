import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import User from '../models/User';
import { TypedRequest, UserRequest } from '../types/express';

interface Reminder_setup {
  start_date?: string;
  end_date?: string;
  times_of_day?: string[]; // Array of times in HH:MM format
  recurrence_rule?: string; // e.g., "FREQ=DAILY;INTERVAL=1" or "FREQ=WEEKLY;BYDAY=MO,WE,FR"
}


interface TaskBody {
  title: string;
  groupID: string;
  assignedBy: string;
  assignedTo?: string;
  description: string;
  deadline?: string;
  reminder?: Reminder_setup;
  priority?: 'low' | 'medium' | 'high' | null;
}

interface TaskStatusBody {
  status: 'pending' | 'in-progress' | 'done';
}

interface TaskCompletionBody {
  completionMethod: 'manual' | 'photo' | 'input';
  notes?: string;
  evidenceUrl?: string; 
}

interface TaskParams {
  taskID: string;
}

//interface for AI Generate
interface AiTaskData {
  title: string;
  description: string;
  start_date: string | null; // YYYY-MM-DD or null
  end_date?: string | null;   // YYYY-MM-DD or null
  times_of_day?: string[];    // Array of "HH:MM"
  recurrence_rule?: string | null;
  assignedTo?: string | null; // User ID string or null
  priority?: 'low' | 'high' | null;
}

interface AiGeneratedTasksRequestBody {
  groupID: string;
  userID: string; //user created task 
  tasks: AiTaskData[];
}

// Helper function for common error handling
const handleError = (res: Response, error: any): void => {
  console.error('Task operation error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
};

// Helper function to check if task exists
const findTask = async (taskID: string, res: Response) => {
  const task = await Task.findById(taskID);
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return null;
  }
  return task;
};

// Create a new task
export const createTask = async (req: TypedRequest<TaskBody>, res: Response): Promise<void> => {
  try {
    const { title, groupID, assignedBy, assignedTo, description, deadline, priority, reminder } = req.body;

    // Validate that assignee exists if assignedTo is chosen
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        res.status(400).json({ message: 'Assigned user does not exist' });
        return;
      }
    }
    // Process reminder data
    let reminderData;
    if (reminder) {
      reminderData = {
        start_date: reminder.start_date ? new Date(reminder.start_date) : undefined,
        end_date: reminder.end_date ? new Date(reminder.end_date) : undefined,
        times_of_day: reminder.times_of_day || [],
        recurrence_rule: reminder.recurrence_rule || undefined
      };
    }
    
    const newTask = new Task({
      title,
      groupID,
      assignedBy,
      assignedTo: assignedTo || undefined,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      priority,
      reminder: reminderData,
      status: 'pending',
      createdAt: new Date()
    });
    
    const savedTask = await newTask.save();   
    res.status(201).json(savedTask);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Get a specific task
export const getTask = async (req: TypedRequest<any, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskID)
      .populate('assignedTo', 'name email role') // Include assignee details
      .populate('assignedBy', 'name email role'); // Include assigner details

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Update a task
export const updateTask = async (req: UserRequest, res: Response): Promise<void> => { // Assuming TaskParams in UserRequest
  try {
    const { taskID } = req.params as unknown as TaskParams; // Cast if params are not directly on UserRequest type
    const updateData: Partial<any> = { ...req.body };

    if (req.body.hasOwnProperty('assignedTo') && req.body.assignedTo === null) {
        updateData.assignedTo = null;
    }
    if (req.body.hasOwnProperty('description') && req.body.description === null) {
        updateData.description = null; 
    }
     if (req.body.hasOwnProperty('priority') && req.body.priority === null) {
        updateData.priority = null;
    }


    if (req.body.reminder) {
      updateData.reminder = {
        start_date: req.body.reminder.start_date ? new Date(req.body.reminder.start_date) : undefined,
        end_date: req.body.reminder.end_date ? new Date(req.body.reminder.end_date) : undefined,
        times_of_day: req.body.reminder.times_of_day || [],
        recurrence_rule: req.body.reminder.recurrence_rule || undefined,
      };
      if (Object.keys(req.body.reminder).length === 0) {
        updateData.reminder = undefined; // Or $unset: { reminder: 1 } in MongoDB update
      }
    } else if (req.body.hasOwnProperty('reminder') && req.body.reminder === null) {
        updateData.reminder = undefined; 
    }


    const task = await Task.findByIdAndUpdate(
      taskID,
      { $set: updateData }, // Use $set to only update provided fields
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email role')
     .populate('assignedBy', 'name email role');

    if (!task) {
      return handleError(res, new Error('Task not found for update.'));
    }
    res.json(task);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Update task status
export const updateTaskStatus = async (req: TypedRequest<TaskStatusBody, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskID);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    // Add timestamp based on status change
    const updates: any = { status: req.body.status };
    
    if (req.body.status === 'in-progress' && task.status === 'pending') {
      updates.acceptedAt = new Date();
    } else if (req.body.status === 'done' && task.status !== 'done') {
      updates.completedAt = new Date();
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskID,
      updates,
      { new: true }
    );
    
    res.json(updatedTask);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Accept task assignment
export const acceptTask = async (req: TypedRequest<any, TaskParams>, res: Response): Promise<void> => {
  try {
    const task = await findTask(req.params.taskID, res);
    if (!task) return;
    
    if (task.status !== 'pending') {
      res.status(400).json({ message: 'Task is already in progress or completed' });
      return;
    }
    
    task.status = 'in-progress';
    task.acceptedAt = new Date();
    await task.save();
    
    res.json(task);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Complete a task with evidence
export const completeTask = async (
  req: TypedRequest<TaskCompletionBody, TaskParams>, 
  res: Response
): Promise<void> => {
  try {
    const { completionMethod, notes, evidenceUrl } = req.body;
    const task = await findTask(req.params.taskID, res);
    if (!task) return;
    
    // Update task with completion details
    task.status = 'done';
    task.completedAt = new Date();
    task.completionMethod = completionMethod;
    if (notes) task.completionNotes = notes;
    
    // Handle photo evidence URL if provided in the request body
    if (completionMethod === 'photo' && evidenceUrl) {
      task.evidenceUrl = evidenceUrl;
    }
    
    await task.save();
    
    res.json({ message: 'Task completed successfully', task });
  } catch (err: any) {
    handleError(res, err);
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
    handleError(res, err);
  }
};

// Get tasks for a specific user
export const getUserTasks = async (req: TypedRequest<any, { userID: string }>, res: Response): Promise<void> => {
  try {
    // Only find tasks that have an assignedTo value matching the user ID
    const tasks = await Task.find({ 
      assignedTo: req.params.userID 
    })      
      .sort({ deadline: 1, priority: -1 })  // Sort by deadline (ascending) and priority (high to low)
      .populate('assignedBy', 'name email');
    
    res.json(tasks);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Get all tasks for a specific group
export const getGroupTasks = async (req: TypedRequest<any, { groupID: string }>, res: Response): Promise<void> => {
  try {
    const { groupID } = req.params;
    const tasks = await Task.find({ groupID })
      .sort({ createdAt: -1 })
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Get recent (just created) tasks for a group (e.g., last 1 hour or with a query param limit)
export const getRecentGroupTasks = async (req: TypedRequest<any, { groupID: string }>, res: Response): Promise<void> => {
  try {
    const { groupID } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    // Option 1: Use createdAt within last hour
    // const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // const tasks = await Task.find({ groupID, createdAt: { $gte: oneHourAgo } })
    //   .sort({ createdAt: -1 })
    //   .limit(limit)
    //   .populate('assignedBy', 'name email')
    //   .populate('assignedTo', 'name email');
    // Option 2: Just get N most recent
    const tasks = await Task.find({ groupID })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err: any) {
    handleError(res, err);
  }
};

// Check for overdue tasks and trigger notifications
export const checkOverdueTasks = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find non-completed tasks with passed deadlines that haven't been escalated
    const overdueTasks = await Task.find({
      deadline: { $lt: now },
      status: { $ne: 'done' },
      escalated: { $ne: true }
    }).populate('assignedTo').populate('assignedBy');
    
    for (const task of overdueTasks) {
      // Mark as escalated to prevent duplicate notifications
      task.escalated = true;
      await task.save();
      // Find appropriate backup users based on role hierarchy
      let backupUserIds: string[] = [];
      if (!task.assignedTo) continue;
      // Ensure assignedTo is populated as a User document
      const assignedToUser = typeof task.assignedTo === 'object' && task.assignedTo !== null && 'role' in task.assignedTo ? task.assignedTo : await User.findById(task.assignedTo);
      if (!assignedToUser) continue;
      
      switch(assignedToUser.role) {
        case 'care_bear':
          // Escalate to care moms and admins
          const caregivers = await User.find({ 
            role: { $in: ['care_mom', 'admin'] },
            _id: { $ne: assignedToUser._id }
          });
          backupUserIds = caregivers.map(user => user._id && typeof user._id === 'object' && 'toString' in user._id ? user._id.toString() : String(user._id));
          break;
          
        case 'care_mom':
          // Escalate to admins
          const admins = await User.find({ role: 'admin' });
          backupUserIds = admins.map(user => user._id && typeof user._id === 'object' && 'toString' in user._id ? user._id.toString() : String(user._id));
          break;
          
        default:
          // No escalation for admin tasks
          break;
      }
      
    }
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
  }
};
