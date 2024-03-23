import express from 'express';
import {
  deleteUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/usersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.patch('/update', authenticateToken, updateUserProfile);
router.delete('/delete-account', authenticateToken, deleteUser);

export default router;
