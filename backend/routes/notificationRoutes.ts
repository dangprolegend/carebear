import express, { Router } from 'express';
import { 
  createNotification, 
  getUserNotifications, 
  deleteNotification,
  markAsRead 
} from '../controllers/notificationController';

const router: Router = express.Router();

router.post('/', createNotification);
router.post('/read', markAsRead);
router.get('/user/:id', getUserNotifications);
router.delete('/:id', deleteNotification);

export default router;