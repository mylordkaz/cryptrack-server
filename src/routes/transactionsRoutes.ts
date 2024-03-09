import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getTotalAmounts,
  getTransactions,
} from '../controllers/transactionsController';

const router = express.Router();

router.get('/all', authenticateToken, getTransactions);
router.get('/total', authenticateToken, getTotalAmounts);

export default router;
