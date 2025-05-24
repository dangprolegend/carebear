import express, { Router } from 'express';
import { checkTodayStatus, getTodayStatus, submitDailyStatus } from '../controllers/dailyController';

const router: Router = express.Router();

router.post('/submit/:userID', submitDailyStatus);
router.get('/check/:userID', checkTodayStatus);
router.get('/today/:userID', getTodayStatus);
export default router;