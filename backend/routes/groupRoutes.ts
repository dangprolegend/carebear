import express, { Router } from 'express';
import { createGroup, getAllGroups, getGroup, updateGroup, deleteGroup, getUserGroups } from '../controllers/groupController';

const router: Router = express.Router();

router.post('/:userID', createGroup);    // Migrated
router.get('/', getAllGroups);           // Migrated
// Moving the specific route '/user/:id' before the general '/:id' route
router.get('/user/:userID', getUserGroups);  // Migrated
router.get('/:groupID', getGroup);            // Migrated
router.put('/:groupID', updateGroup);         // Migrated
router.delete('/:groupID', deleteGroup);      // Migrated
export default router;