import express, { Router } from 'express';
import { getUser, updateUser, deleteUser, getUserTasks } from '../controllers/userController';

const router: Router = express.Router();

router.get('/:userID', getUser);  
router.put('/:userID', updateUser);  
router.delete('/:userID', deleteUser);  
router.get('/:userID/tasks', getUserTasks)

export default router;