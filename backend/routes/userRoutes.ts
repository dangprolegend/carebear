import express, { Router } from 'express';
import { getUser, updateUser, deleteUser } from '../controllers/userController';

const router: Router = express.Router();

router.get('/:userID', getUser);  
router.put('/:userID', updateUser);  
router.delete('/:userID', deleteUser);  

export default router;