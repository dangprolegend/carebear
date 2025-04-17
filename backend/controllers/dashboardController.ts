import { Response } from 'express';
import Dashboard from '../models/Dashboard';
import Task from '../models/Task';
import { TypedRequest } from '../types/express';

interface DashboardMetricBody {
  user: string;  // Changed from userID to user
  task: string;  // Changed from taskID to task
  metric_value: number;
}

// Add metric data to dashboard
export const addMetric = async (req: TypedRequest<DashboardMetricBody>, res: Response): Promise<void> => {
  try {
    const { user, task, metric_value } = req.body;
    
    const newMetric = new Dashboard({
      user,
      task,
      metric_value,
      created_timestamp: new Date()
    });
    
    const savedMetric = await newMetric.save();
    res.status(201).json(savedMetric);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard metrics for a user
export const getUserMetrics = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    // Tasks completed over time
    const completedTasks = await Task.find({
      assignedTo: req.params.id,
      status: 'done'
    }).sort({ updatedAt: 1 });
    
    // Get all dashboard entries for this user
    const metrics = await Dashboard.find({ user: req.params.id })
      .populate('task')
      .sort({ created_timestamp: -1 });
    
    res.json({
      completedTasks: completedTasks.length,
      metrics
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard metrics for a group
export const getGroupMetrics = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const completedTasks = await Task.find({
      group: req.params.id,
      status: 'done'
    });
    
    const pendingTasks = await Task.find({
      group: req.params.id,
      status: { $ne: 'done' }
    });
    
    res.json({
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      totalTasks: completedTasks.length + pendingTasks.length,
      completionRate: completedTasks.length > 0 ? 
        (completedTasks.length / (completedTasks.length + pendingTasks.length)) * 100 : 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};