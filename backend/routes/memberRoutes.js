import express from 'express';
import { addMember, updateMemberRole, removeMember, getMember } from '../controllers/memberController.js';

const router = express.Router();

router.post('/:groupID/members', addMember);
router.get('/:groupID/members/:userID', getMember);
router.put('/:groupID/members/:userID', updateMemberRole);
router.delete('/:groupID/members/:userID', removeMember);

export default router;