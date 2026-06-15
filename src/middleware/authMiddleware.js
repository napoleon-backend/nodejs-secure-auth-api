import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Middleware to protect routes: verifies JWT and ensures user existence.
 * Enterprise grade: checks Authorization header and HttpOnly cookies.
 */
export const protect = catchAsync(async (req, res, next) => {
  // 1) Check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    const error = new Error('Login to get access');
    error.statusCode = 401;
    return next(error);
  }

  // 2) Verify token
  // Promisifying jwt.verify to use async/await
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(
      new Error('Internal Server Error: JWT Secret is not configured.'),
    );
  }

  const decoded = await promisify(jwt.verify)(token, secret);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    const error = new Error(
      'The user belonging to this token no longer exists.',
    );
    error.statusCode = 401;
    return next(error);
  }

  // 4) Check if user is verified (Optional but recommended for enterprise)
  if (!currentUser.isVerified) {
    const error = new Error('Please verify your account');
    error.statusCode = 403;
    return next(error);
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  // We attach the user to the request object for use in subsequent middleware/controllers
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
