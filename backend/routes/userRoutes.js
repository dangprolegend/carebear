import express from 'express';
import {
  getUser,
  signup,
  login,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/users/:userID', getUser);
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.put('/users/:userID', updateUser);
router.delete('/users/:userID', deleteUser);

export default router;
