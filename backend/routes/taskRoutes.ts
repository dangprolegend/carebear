import express, { Router } from 'express';
import { 
  createTask, 
  getTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from '../controllers/taskController';

const router: Router = express.Router();

router.post('/', createTask);
router.put('/:taskID/status', updateTaskStatus);
router.get('/:taskID', getTask);
router.put('/:taskID', updateTask);
router.delete('/:taskID', deleteTask);

export default router;