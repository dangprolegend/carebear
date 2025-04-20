import { Response } from 'express';
import Notification from '../models/Notification';
import { TypedRequest } from '../types/express';

interface NotificationBody {
  userID: string;  // Changed from userID to user
  taskID: string;  // Changed from taskID to task
}

interface NotificationParams {
  id: string;
}

// Create a new notification
export const createNotification = async (req: TypedRequest<NotificationBody>, res: Response): Promise<void> => {
  try {
    const { userID, taskID } = req.body;
    const newNotification = new Notification({
      userID,
      taskID,
      createdAt: new Date()
    });
    
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get notifications for a user
export const getUserNotifications = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.params.id })
      .populate('task')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a notification
export const deleteNotification = async (req: TypedRequest<any, NotificationParams>, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Mark notifications as read (by deleting them)
export const markAsRead = async (req: TypedRequest<{ notificationIds: string[] }>, res: Response): Promise<void> => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || notificationIds.length === 0) {
      res.status(400).json({ message: 'No notification IDs provided' });
      return;
    }
    
    await Notification.deleteMany({ _id: { $in: notificationIds } });
    
    res.json({ message: 'Notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};