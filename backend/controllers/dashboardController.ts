import { Response } from 'express';
import Dashboard from '../models/Dashboard';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';

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

// Get dashboard metrics by userID
export const getMetricByUserID = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const userID = new mongoose.Types.ObjectId(req.params.userID);
    const metrics = await Dashboard.find({ userID });
    
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard metric by dashboardID
export const getMetricByMetricID = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const metricID = new mongoose.Types.ObjectId(req.params.metricID);
    const metrics = await Dashboard.findById(metricID);
    
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update dashboard metrics by dashboardID
export const updateMetric = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.metricID,
      {
        userID: req.body.userID,
        metric: req.body.metric,
        metric_unit: req.body.metric_unit,
        metric_value: req.body.metric_value
    },
      { new: true }
    );
    if (!dashboard) {
      res.status(404).json({ message: 'Dashboard not found' });
      return;
    }
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete dashboard metrics by dashboardID
export const deleteMetric = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const metrics = await Dashboard.findByIdAndDelete(req.params.metricID);
    
    if (!metrics) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};