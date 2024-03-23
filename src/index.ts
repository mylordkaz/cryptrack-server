import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionsRoutes';
import cryptoRoutes from './routes/cryptoRoutes';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

const corsOptions: CorsOptions = {
  origin: 'https://mycryptrack.netlify.app', // 'http://localhost:5173',
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/cryptos', cryptoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
