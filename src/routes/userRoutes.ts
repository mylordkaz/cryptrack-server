import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/usersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.patch('/update', authenticateToken, updateUserProfile);

export default router;
