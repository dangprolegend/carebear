import { Router } from 'express';
import { getFeed, getGroupFeed, getUserFeed, getActivitySummary, updateMood } from '../controllers/feedController';

const router = Router();

router.get('/:userID', getFeed);  
router.put('/update-mood/:userID', updateMood);
router.get('/:userID/group/:groupID', getGroupFeed);  
router.get('/:userID/user/:targetUserID', getUserFeed);  
router.get('/:userID/activity-summary', getActivitySummary);
router.get('/:userID/group/:groupID/activity-summary', getActivitySummary); 

export default router;
