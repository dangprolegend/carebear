import express, { Router } from 'express';
import { createGroup, getAllGroups, getGroup, updateGroup, deleteGroup, getUserGroups, getGroupMembers, getGroupTasks, getUsersByGroupID } from '../controllers/groupController';

const router: Router = express.Router();

router.post('/:userID', createGroup);    // Migrated
router.get('/', getAllGroups);           // Migrated
// Moving the specific route '/user/:id' before the general '/:id' route
router.get('/user/:userID', getUserGroups);  // Migrated
router.get('/:groupID', getGroup);            // Migrated
router.put('/:groupID', updateGroup);         // Migrated
router.delete('/:groupID', deleteGroup);      // Migrated
router.get('/:groupID/members', getGroupMembers); // Add the missing members route
router.get('/:groupID/tasks', getGroupTasks); // Added new route to get tasks of a group
router.get('/:groupID/users', (req, res, next) => {
	// @ts-ignore
	return getUsersByGroupID(req, res, next);
});
export default router;