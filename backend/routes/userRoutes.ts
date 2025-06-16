import express, { Router } from 'express';
import { getUser, provideAdditionalUserInfo, getUserIdByClerkId, getUserGroup, getUserInfo, getFamilyMembers, updateUser, checkUserAdminStatus, getCurrentUserFamilyRole, getAllGroups } from '../controllers/userController';
import { createGroup, joinGroup } from '../controllers/groupController';
import { sendInvitation } from '../controllers/invitationController';

const router: Router = express.Router();

router.get('/:userID/group', getUserGroup);
router.get('/:userID/allGroups', getAllGroups);
router.patch('/:userID/onboarding', provideAdditionalUserInfo);
router.get('/clerk/:clerkID', getUserIdByClerkId);
router.post('/:userID/createGroup', createGroup);
router.patch('/:userID/joinGroup', joinGroup); 
router.get('/:userID/info', getUserInfo);
router.get('/:userID/familyMembers', getFamilyMembers);
router.post('/:userID/invite', sendInvitation);
router.patch('/:userID/update', updateUser);
router.get('/:userID/groups/:groupID/admin-status', checkUserAdminStatus);
router.get('/:userID/role', getCurrentUserFamilyRole);

export default router;