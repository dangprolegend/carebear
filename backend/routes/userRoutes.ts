import express, { Router } from 'express';
import { getUser, provideAdditionalUserInfo, getUserIdByClerkId, getUserGroup } from '../controllers/userController';
import { createGroup, joinGroup } from '../controllers/groupController';

const router: Router = express.Router();

router.get('/:userID/group', getUserGroup);  
router.patch('/:userID/onboarding', provideAdditionalUserInfo);
router.get('/clerk/:clerkID', getUserIdByClerkId);
router.post('/:userID/createGroup', createGroup);
router.patch('/:userID/joinGroup', joinGroup); 
export default router;