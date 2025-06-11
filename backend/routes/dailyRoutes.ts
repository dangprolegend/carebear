import express, { Router } from 'express';
import { checkTodayStatus, getStatusHistory, getStatusStats, getTodayStatus, submitDailyStatus } from '../controllers/dailyController';

const router: Router = express.Router();

router.post('/submit/:userID', submitDailyStatus);
router.get('/check/:userID', checkTodayStatus);
router.get('/today/:userID', getTodayStatus);
router.get('/history/:userID', getStatusHistory);
router.get('/stats/:userID', getStatusStats);


export default router;
