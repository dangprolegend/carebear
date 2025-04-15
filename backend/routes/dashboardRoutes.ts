import express, { Router } from 'express';
import { addMetric, getUserMetrics, getGroupMetrics } from '../controllers/dashboardController';

const router: Router = express.Router();

router.post('/metric', addMetric);
router.get('/user/:id', getUserMetrics);
router.get('/group/:id', getGroupMetrics);

export default router;