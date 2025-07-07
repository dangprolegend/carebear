import { Response } from 'express';
import Notification from '../models/Notification';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';
import User from '../models/User';
interface NotificationBody {
  userID: string;  
  taskID: string;  
}

interface NotificationParams {
  id: string;
}
interface NotificationPreferences {
  doNotDisturb: boolean;
  newFeed: boolean;
  newActivity: boolean;
  invites: boolean;
}

interface NotificationPreferencesBody {
  doNotDisturb?: boolean;
  newFeed?: boolean;
  newActivity?: boolean;
  invites?: boolean;
}

// Create a new notification
export const createNotification = async (req: TypedRequest<NotificationBody & { type?: string }>, res: Response): Promise<void> => {
  try {
    const { userID, taskID, type = 'newActivity' } = req.body;
    
    const shouldSend = await shouldSendNotification(userID, type as 'newFeed' | 'newActivity' | 'invites');
    
    if (!shouldSend) {
      res.status(200).json({ 
        message: 'Notification not created due to user preferences',
        userID,
        taskID,
        type,
        skipped: true
      });
      return;
    }
    
    const newNotification = new Notification({
      userID,
      taskID,
      type,
      status: 'pending',
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

export const shouldSendNotification = async (userID: string, notificationType: 'newFeed' | 'newActivity' | 'invites'): Promise<boolean> => {
  try {
    const user = await User.findById(userID).select('notificationPreferences');
    
    if (!user) {
      return false;
    }
    
    const preferences: NotificationPreferences = (user.notificationPreferences as NotificationPreferences) || {
      doNotDisturb: false,
      newFeed: true,
      newActivity: true,
      invites: true
    };
    
    // If Do Not Disturb is enabled, don't send any notifications
    if (preferences.doNotDisturb) {
      return false;
    }
    
    // Check specific notification type
    return preferences[notificationType] || false;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return false;
  }
};

// Enhanced refresh notification settings function
export const refreshNotificationSettings = async (req: any, res: Response): Promise<void> => {
  try {
    const { userID } = req.body;
    
    if (!userID) {
      res.status(400).json({ error: "userID is required" });
      return;
    }
    
    const userObjectId = new mongoose.Types.ObjectId(userID);
    const user = await User.findById(userObjectId).select('notificationPreferences');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const preferences: NotificationPreferences = (user.notificationPreferences as NotificationPreferences) || {
      doNotDisturb: false,
      newFeed: true,
      newActivity: true,
      invites: true
    };
    
    // If Do Not Disturb is enabled, cancel pending notifications
    if (preferences.doNotDisturb) {
      const cancelResult = await Notification.updateMany(
        { 
          userID: userObjectId,
          status: { $ne: 'sent' } // Only update notifications that haven't been sent
        },
        { 
          $set: { 
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelReason: 'Do Not Disturb enabled'
          }
        }
      );
      
      console.log(`Cancelled ${cancelResult.modifiedCount} pending notifications for user: ${userID} (Do Not Disturb)`);
    }
    
    // Log the refresh action
    console.log(`Notification settings refreshed for user: ${userID}`, {
      doNotDisturb: preferences.doNotDisturb,
      newFeed: preferences.newFeed,
      newActivity: preferences.newActivity,
      invites: preferences.invites
    });
    
    // Return success with current preferences
    res.status(200).json({ 
      success: true, 
      message: "Notification settings refreshed successfully",
      preferences: preferences,
      timestamp: new Date()
    });
  } catch (err: any) {
    console.error("Error refreshing notification settings:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update notification preferences for a user
export const updateNotificationPreferences = async (req: TypedRequest<NotificationPreferencesBody, { userID: string }>, res: Response): Promise<void> => {
  try {
    const userID = new mongoose.Types.ObjectId(req.params.userID);
    const { doNotDisturb, newFeed, newActivity, invites } = req.body;
    
    const user = await User.findById(userID);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Build update object
    const updateData: any = {};
    
    if (doNotDisturb !== undefined) {
      updateData['notificationPreferences.doNotDisturb'] = doNotDisturb;
      
      // If Do Not Disturb is enabled, disable all other notifications
      if (doNotDisturb) {
        updateData['notificationPreferences.newFeed'] = false;
        updateData['notificationPreferences.newActivity'] = false;
        updateData['notificationPreferences.invites'] = false;
      }
    }
    
    if (newFeed !== undefined) {
      updateData['notificationPreferences.newFeed'] = newFeed;
      // If enabling any notification, turn off Do Not Disturb
      if (newFeed) {
        updateData['notificationPreferences.doNotDisturb'] = false;
      }
    }
    
    if (newActivity !== undefined) {
      updateData['notificationPreferences.newActivity'] = newActivity;
      // If enabling any notification, turn off Do Not Disturb
      if (newActivity) {
        updateData['notificationPreferences.doNotDisturb'] = false;
      }
    }
    
    if (invites !== undefined) {
      updateData['notificationPreferences.invites'] = invites;
      // If enabling any notification, turn off Do Not Disturb
      if (invites) {
        updateData['notificationPreferences.doNotDisturb'] = false;
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { $set: updateData },
      { new: true }
    ).select('notificationPreferences');
    
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Type assertion to ensure we have the correct structure
    const userPreferences = updatedUser.notificationPreferences as NotificationPreferences;
    
    // If Do Not Disturb is enabled, cancel pending notifications
    if (userPreferences?.doNotDisturb) {
      await Notification.updateMany(
        { 
          userID: userID,
          status: { $ne: 'sent' } // Only update notifications that haven't been sent
        },
        { 
          $set: { 
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelReason: 'Do Not Disturb enabled'
          }
        }
      );
    }
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: userPreferences
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get notification preferences for a user
export const getNotificationPreferences = async (req: TypedRequest<any, { userID: string }>, res: Response): Promise<void> => {
  try {
    const userID = new mongoose.Types.ObjectId(req.params.userID);
    const user = await User.findById(userID).select('notificationPreferences');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Return preferences with defaults if not set
    const preferences: NotificationPreferences = (user.notificationPreferences as NotificationPreferences) || {
      doNotDisturb: false,
      newFeed: true,
      newActivity: true,
      invites: true
    };
    
    res.json(preferences);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
