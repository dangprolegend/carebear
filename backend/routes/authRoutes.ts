import express, { Router } from 'express';
import { login, signup } from '../controllers/authController';

const router: Router = express.Router();

router.post('/clerk', express.raw({ type: 'application/json' }), signup);

export default router;