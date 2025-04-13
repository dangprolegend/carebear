import express from 'express';
import { createGroup, getGroup, getGroupMembers } from '../controllers/groupController.js';

const router = express.Router();

router.post('/', createGroup);
router.get('/:groupID', getGroup); 
router.get('/:groupID/members', getGroupMembers);

export default router;  