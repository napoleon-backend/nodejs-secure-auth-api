import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mount User Routes
app.use('/api/v1/users', userRouter);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

app.use(errorMiddleware);

export default app;
