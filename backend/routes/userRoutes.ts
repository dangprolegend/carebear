import express, { Router } from 'express';
import { getUser, provideAdditionalUserInfo, getUserIdByClerkId, getUserGroup, getUserInfo, getFamilyMembers, updateUser, checkUserAdminStatus } from '../controllers/userController';
import { createGroup, joinGroup } from '../controllers/groupController';
import { sendInvitation } from '../controllers/invitationController';

const router: Router = express.Router();

router.get('/:userID/group', getUserGroup);  
router.patch('/:userID/onboarding', provideAdditionalUserInfo);
router.get('/clerk/:clerkID', getUserIdByClerkId);
router.post('/:userID/createGroup', createGroup);
router.patch('/:userID/joinGroup', joinGroup); 
router.get('/:userID/info', getUserInfo);
router.get('/:userID/familyMembers', getFamilyMembers);
router.post('/:userID/invite', sendInvitation);
router.patch('/:userID/update', updateUser);
router.get('/:userID/groups/:groupID/admin-status', checkUserAdminStatus);

export default router;