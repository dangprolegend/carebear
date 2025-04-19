import express, { Router } from 'express';
import { addMember, updateMember, removeMember } from '../controllers/memberController';

const router: Router = express.Router();

router.post('/:groupID/members', addMember); // Migrated
// Moving specific routes before the pattern-matching route
router.put('/:groupID/members/:userID', updateMember); // Migrated
router.delete('/:groupID/members/:userID', removeMember); // Migrated

export default router;