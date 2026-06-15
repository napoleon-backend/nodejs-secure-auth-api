import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js';
import userRouter from './src/routes/userRoutes.js';
import errorMiddleware from './src/middleware/errorMiddleware.js';

// Enterprise Grade: Validate required environment variables on startup
const requiredEnv = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_COOKIE_EXPIRES_IN',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `❌ FATAL: Environment variable ${env} is missing in .env file.`,
    );
    // Use process.exit(1) instead of throw to avoid messy stack traces during startup configuration errors
    process.exit(1);
  }
});

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mount User Routes
app.use('/api/v1/users', userRouter);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

app.use(errorMiddleware);

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});

export default app;
