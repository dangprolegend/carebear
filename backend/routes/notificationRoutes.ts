import express, { Router } from 'express';
import { 
  createNotification, 
  getUserNotifications, 
  deleteNotification,
  updateNotification,
  getNotificationByID
} from '../controllers/notificationController';

const router: Router = express.Router();

router.post('/', createNotification); // Done migrated
router.get('/user/:userID', getUserNotifications); // Done migrated
router.delete('/:notificationID', deleteNotification); // Done migrated
router.put('/:notificationID', updateNotification)
router.get('/:notificationID', getNotificationByID)

export default router;