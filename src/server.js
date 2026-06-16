import 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';

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
    process.exit(1);
  }
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
