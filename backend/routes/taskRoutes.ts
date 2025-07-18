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
  getUserTaskCompletionPercentage,
  markTaskAsReadByUser,
  getUnreadTasksCount,
  markAllTasksAsReadByUser
} from '../controllers/taskController';
import { canManageTasks, hasTaskPermission, isAdmin, canManageSpecificTask } from '../middlewares/permissions';

const router: Router = express.Router();



/**
 * @swagger
 * /api/tasks/{taskID}/complete:
 *   post:
 *     summary: Complete a task with specified completion method
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         description: The ID of the task to complete
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completionMethod:
 *                 type: string
 *                 enum: [manual, photo, input]
 *               notes:
 *                 type: string
 *               evidenceUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task completed successfully
 */
router.post('/:taskID/complete', completeTask);


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

/**
 * @swagger
 * /api/tasks/{taskID}/read:
 *   post:
 *     summary: Mark a task as read by a user
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         description: The ID of the task to mark as read
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The ID of the user who read the task
 *     responses:
 *       200:
 *         description: Task marked as read successfully
 */
router.post('/:taskID/read', markTaskAsReadByUser);

/**
 * @swagger
 * /api/tasks/user/{userID}/group/{groupID}/unread:
 *   get:
 *     summary: Get count of unread tasks for a user in a group
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
 *         description: Unread tasks count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   description: Number of unread tasks
 */
router.get('/user/:userID/group/:groupID/unread', getUnreadTasksCount);

/**
 * @swagger
 * /api/tasks/user/{userID}/group/{groupID}/mark-all-read:
 *   post:
 *     summary: Mark all tasks in a group as read by a user
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
 *         description: All tasks marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                   description: Number of tasks marked as read
 */
router.post('/user/:userID/group/:groupID/mark-all-read', markAllTasksAsReadByUser);

export default router;