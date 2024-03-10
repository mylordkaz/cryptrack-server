import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  addTransaction,
  deleteTransaction,
  getTotalAmounts,
  getTransactions,
} from '../controllers/transactionsController';

const router = express.Router();

router.get('/all', authenticateToken, getTransactions);
router.get('/total', authenticateToken, getTotalAmounts);
router.post('/add', authenticateToken, addTransaction);
router.delete('/:transactionId', authenticateToken, deleteTransaction);

export default router;
