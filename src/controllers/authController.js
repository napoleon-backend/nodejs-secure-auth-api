import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import User from '../model/userModel.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Signs a JWT token for a specific user ID.
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Configures HttpOnly cookie and sends standardized JSON response with token.
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || false,
  };

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};

export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Token is invalid or has expired.');
    error.statusCode = 400;
    return next(error);
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Incorrect email or password');
    error.statusCode = 401;
    return next(error);
  }

  createSendToken(user, 200, res);
});

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    const error = new Error(
      'This route is not for password updates. Please use /resetPassword.',
    );
    error.statusCode = 400;
    return next(error);
  }

  const filteredBody = {};
  const allowedFields = ['name', 'email'];
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
