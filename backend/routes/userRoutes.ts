import express, { Router } from 'express';
import { getUser, updateUser, deleteUser, getUserTasks, getUserNotifications, provideAdditionalUserInfo } from '../controllers/userController';

const router: Router = express.Router();

router.get('/:userID', getUser);  
router.put('/:userID', updateUser);  
router.patch('/:userID/onboarding', provideAdditionalUserInfo);
router.delete('/:userID', deleteUser);  
router.get('/:userID/tasks', getUserTasks);
router.get('/:userID/notifications', getUserNotifications); 
export default router;