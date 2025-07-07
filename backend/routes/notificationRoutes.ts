import express, { Router } from 'express';
import { 
  createNotification, 
  getUserNotifications, 
  deleteNotification,
  updateNotification,
  getNotificationByID,
  refreshNotificationSettings
} from '../controllers/notificationController';

const router: Router = express.Router();

router.post('/', createNotification); // Done migrated
router.get('/user/:userID', getUserNotifications); // Done migrated
router.delete('/:notificationID', deleteNotification); // Done migrated
router.put('/:notificationID', updateNotification)
router.get('/:notificationID', getNotificationByID)
router.post('/refresh-settings', refreshNotificationSettings) // Refresh notification settings

export default router;