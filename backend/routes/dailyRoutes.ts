import express, { Router } from 'express';
import { checkTodayStatus, getStatusHistory, getStatusStats, getTodayStatus, submitDailyStatus, updateDailyStatus } from '../controllers/dailyController';

const router: Router = express.Router();

router.post('/submit/:userID', submitDailyStatus);
router.put('/update/:userID', updateDailyStatus); // new route to update mood and body
router.get('/check/:userID', checkTodayStatus);
router.get('/today/:userID', getTodayStatus);
router.get('/history/:userID', getStatusHistory);
router.get('/stats/:userID', getStatusStats);


export default router;
