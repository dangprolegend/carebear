import express, { Router } from 'express';
import { 
  createAiGeneratedTasks,
  createTask, 
  getTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask,
  acceptTask,
  completeTask,
  getUserTasks
} from '../controllers/taskController';
import { canManageTasks, hasTaskPermission, isAdmin, canManageSpecificTask } from '../middlewares/permissions';

const router: Router = express.Router();
//Create new task, using AI (carebear only) 
router.post('/ai_generate', canManageTasks, createAiGeneratedTasks); // Use appropriate middleware

// Create new task (carebear only)
router.post('/', canManageTasks, createTask);

// Get task details (with permission check)
router.get('/:taskID', hasTaskPermission, getTask);

// Update task (admin & care_mom who created it only)
router.put('/:taskID', canManageSpecificTask, updateTask);

// Delete task (admin & care_mom who created it only)
router.delete('/:taskID', canManageSpecificTask, deleteTask);

// Update task status
router.put('/:taskID/status', hasTaskPermission, updateTaskStatus);

// Accept task assignment (assigned user only)
router.post('/:taskID/accept', hasTaskPermission, acceptTask);

// Complete task with optional photo evidence
router.post('/:taskID/complete', hasTaskPermission, completeTask);

// Get tasks for user
router.get('/user/:userID', getUserTasks);

export default router;