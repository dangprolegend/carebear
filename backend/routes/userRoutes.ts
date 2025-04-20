import express, { Router } from 'express';
import { getUser, updateUser, deleteUser, getUserTasks, getUserNotifications } from '../controllers/userController';

const router: Router = express.Router();

router.get('/:userID', getUser);  
router.put('/:userID', updateUser);  
router.delete('/:userID', deleteUser);  
router.get('/:userID/tasks', getUserTasks);
router.get('/:userID/notifications', getUserNotifications); 
export default router;