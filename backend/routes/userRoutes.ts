import express, { Router } from 'express';
import { getUser, getAllUsers, signup, login, updateUser, deleteUser } from '../controllers/userController';

const router: Router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);

// User routes
router.get('/', getAllUsers); // New route to get all users
router.get('/:id', getUser);  // Changed from :userID to :id
router.put('/:id', updateUser);  // Changed from :userID to :id
router.delete('/:id', deleteUser);  // Changed from :userID to :id

export default router;