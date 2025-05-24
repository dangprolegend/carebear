import express, { Router } from 'express';
import { submitDailyStatus } from '../controllers/dailyController';

const router: Router = express.Router();

router.post('/submit/:userID', submitDailyStatus);

export default router;