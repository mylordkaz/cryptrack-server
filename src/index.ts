import express from 'express';
import cors, { CorsOptions } from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = 3000;

const corsOptions: CorsOptions = {
  origin: 'http://localhost:5174', // Add your frontend origin(s) here
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(express.json());
app.use(cors(corsOptions));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
