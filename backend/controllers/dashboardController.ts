import { Response } from 'express';
import Dashboard from '../models/Dashboard';
import Task from '../models/Task';
import { TypedRequest } from '../types/express';

interface DashboardMetricBody {
  userID: string; 
  metric: string;
  metric_unit: string;
  metric_value: number;
}

// Add metric data to dashboard
export const addMetric = async (req: TypedRequest<DashboardMetricBody>, res: Response): Promise<void> => {
  try {
    const { userID, metric, metric_unit, metric_value } = req.body;
    
    const newMetric = new Dashboard({
      userID,
      metric,
      metric_unit,
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