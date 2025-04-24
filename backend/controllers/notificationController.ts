import { Response } from 'express';
import Notification from '../models/Notification';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';

interface NotificationBody {
  userID: string;  
  taskID: string;  
}

interface NotificationParams {
  id: string;
}

// Create a new notification
// Done migrated
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
// Done migrated
export const getUserNotifications = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const userID = new mongoose.Types.ObjectId(req.params.userID);
    const notifications = await Notification.find({ userID }).populate('taskID').sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


// Get notification by notificationID
export const getNotificationByID = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
  try {
    const notificationID = new mongoose.Types.ObjectId(req.params.notificationID);
    const notifications = await Notification.findById(notificationID);
    
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a notification
// Done migrated
export const deleteNotification = async (req: TypedRequest<any, NotificationParams>, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationID);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update a notification by notificationID
export const updateNotification = async (req: TypedRequest<any, NotificationParams>, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationID,
      {
        userID: req.body.userID,
        taskID: req.body.taskID,
    },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

