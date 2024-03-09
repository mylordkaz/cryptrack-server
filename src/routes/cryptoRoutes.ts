import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getCryptoPrices } from '../controllers/cryptoController';

const router = express.Router();

router.get('/prices', authenticateToken, getCryptoPrices);

export default router;
