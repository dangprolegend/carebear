import express, { Router } from 'express';
import { 
  createTask, 
  getTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask,
  acceptTask,
  completeTask,
  getUserTasks,
  getUserGroupTasks,
  getGroupTasks,
  getRecentGroupTasks,
  getUserTaskCompletionPercentage
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

// Create new task (carebear only)
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

/**
 * @swagger
 * /api/tasks/group/:groupID:
 *   get:
 *     summary: Get all tasks for a group
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         description: The ID of the group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/group/:groupID', getGroupTasks);

/**
 * @swagger
 * /api/tasks/group/:groupID/recent:
 *   get:
 *     summary: Get recent (just created) tasks for a group
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         description: The ID of the group
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Max number of recent tasks to return
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent tasks retrieved successfully
 */
router.get('/group/:groupID/recent', getRecentGroupTasks);

/**
 * @swagger
 * /api/tasks/user/:userID/group/:groupID:
 *   get:
 *     summary: Get all tasks assigned to a specific user in a specific group
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: groupID
 *         required: true
 *         description: The ID of the group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/user/:userID/group/:groupID', getUserGroupTasks);

/**
 * @swagger
 * /api/tasks/user/:userID:
 *   get:
 *     summary: Get all tasks assigned to a specific user
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/user/:userID', getUserTasks);

/**
 * @swagger
 * /api/tasks/user/:userID/group/:groupID/completion:
 *   get:
 *     summary: Get task completion percentage for a specific user in a specific group
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: groupID
 *         required: true
 *         description: The ID of the group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task completion statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: number
 *                   description: Total number of tasks assigned to the user in the group
 *                 completedTasks:
 *                   type: number
 *                   description: Number of completed tasks
 *                 pendingTasks:
 *                   type: number
 *                   description: Number of pending or in-progress tasks
 *                 completionPercentage:
 *                   type: number
 *                   description: Percentage of completed tasks (0-100)
 */
router.get('/user/:userID/group/:groupID/completion', getUserTaskCompletionPercentage);

export default router;