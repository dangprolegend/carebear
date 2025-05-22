import express, { Router } from 'express';
import { 
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

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 groupID:
 *                   type: string
 *                 assignedBy:
 *                   type: string
 *                 status:
 *                   type: string
 *                 description:
 *                   type: string
 *                 reminder:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 escalated:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 */
router.post('/', createTask);

/**
 * @swagger
 * /api/tasks/{taskID}/status:
 *   put:
 *     summary: Update a task's status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         description: The ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the task
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 groupID:
 *                   type: string
 *                 assignedBy:
 *                   type: string
 *                 status:
 *                   type: string
 *                 description:
 *                   type: string
 *                 reminder:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 escalated:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 */
router.put('/:taskID/status', updateTaskStatus);

/**
 * @swagger
 * /api/tasks/{taskID}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         description: The ID of the task to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 groupID:
 *                   type: string
 *                 assignedBy:
 *                   type: string
 *                 status:
 *                   type: string
 *                 description:
 *                   type: string
 *                 reminder:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 escalated:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 */
router.get('/:taskID', getTask);

/**
 * @swagger
 * /api/tasks/{taskID}:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         description: The ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 groupID:
 *                   type: string
 *                 assignedBy:
 *                   type: string
 *                 status:
 *                   type: string
 *                 description:
 *                   type: string
 *                 reminder:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 escalated:
 *                   type: boolean
 */
router.put('/:taskID', updateTask);

/**
 * @swagger
 * /api/tasks/{taskID}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         description: The ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/:taskID', deleteTask);

export default router;