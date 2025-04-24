import express, { Router } from 'express';
import { addMetric, getMetricByUserID, getMetricByMetricID, updateMetric, deleteMetric } from '../controllers/dashboardController';

const router: Router = express.Router();

router.post('/', addMetric);
router.get('/user/:userID', getMetricByUserID)
router.get('/:metricID', getMetricByMetricID)
router.put('/:metricID', updateMetric)
router.delete('/:metricID', deleteMetric)

export default router;