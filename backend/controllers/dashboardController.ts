import { Response } from 'express';
import Dashboard from '../models/Dashboard';
import Task from '../models/Task';
import { TypedRequest } from '../types/express';

interface DashboardMetricBody {
  userID: string;  // Changed from userID to user
  taskID: string;  // Changed from taskID to task
  metric_value: number;
}

// Add metric data to dashboard
export const addMetric = async (req: TypedRequest<DashboardMetricBody>, res: Response): Promise<void> => {
  try {
    const { userID, taskID, metric_value } = req.body;
    
    const newMetric = new Dashboard({
      userID,
      taskID,
      metric_value,
      created_timestamp: new Date()
    });
    
    const savedMetric = await newMetric.save();
    res.status(201).json(savedMetric);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard metrics for a group
export const getGroupMetrics = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const completedTasks = await Task.find({
      group: req.params.groupID,
      status: 'done'
    });
    
    const pendingTasks = await Task.find({
      group: req.params.groupID,
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