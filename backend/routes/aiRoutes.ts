import express from 'express';
import { suggestTasksFromInput } from '../controllers/aiController';

const router = express.Router();

router.post('/suggest-tasks', suggestTasksFromInput);
export default router;