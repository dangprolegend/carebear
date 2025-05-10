import express, { Router } from 'express';
import { getUser, provideAdditionalUserInfo, getUserIdByClerkId } from '../controllers/userController';

const router: Router = express.Router();

router.get('/:userID', getUser);  
router.patch('/:userID/onboarding', provideAdditionalUserInfo);
router.get('/clerk/:clerkID', getUserIdByClerkId);
export default router;