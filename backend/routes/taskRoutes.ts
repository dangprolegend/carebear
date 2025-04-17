import express, { Router } from 'express';
import { 
  createTask, 
  getGroupTasks, 
  getUserTasks, 
  getTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from '../controllers/taskController';

const router: Router = express.Router();

router.post('/', createTask);
// Moving specific routes before the pattern-matching route
router.get('/group/:id', getGroupTasks);
router.get('/user/:id', getUserTasks);
router.put('/:id/status', updateTaskStatus);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;