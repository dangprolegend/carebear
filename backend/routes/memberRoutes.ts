import express, { Router } from 'express';
import { addMember, updateMember, removeMember, getUserMemberships } from '../controllers/memberController';

const router: Router = express.Router();

router.post('/', addMember);
// Moving specific routes before the pattern-matching route
router.get('/user/:id', getUserMemberships);
router.put('/:id', updateMember);
router.delete('/:id', removeMember);

export default router;