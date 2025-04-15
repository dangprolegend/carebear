import express, { Router } from 'express';
import { createGroup, getAllGroups, getGroup, updateGroup, deleteGroup, getUserGroups } from '../controllers/groupController';

const router: Router = express.Router();

router.post('/', createGroup);
router.get('/', getAllGroups);
// Moving the specific route '/user/:id' before the general '/:id' route
router.get('/user/:id', getUserGroups); 
router.get('/:id', getGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
export default router;