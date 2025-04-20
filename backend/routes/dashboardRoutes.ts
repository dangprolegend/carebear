import express, { Router } from 'express';
import { addMetric } from '../controllers/dashboardController';

const router: Router = express.Router();

router.post('/', addMetric);

export default router;