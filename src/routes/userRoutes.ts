import express from 'express';
import { getUserProfile } from '../controllers/usersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);

export default router;