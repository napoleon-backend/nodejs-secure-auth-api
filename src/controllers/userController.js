import * as userService from '../services/userService.js';
import catchAsync from '../utils/catchAsync.js';
import sendEmail from '../utils/email.js';
import { createSendToken } from './authController.js';

/**
 * HTTP Handler for creating a user.
 */
export const createUserHandler = catchAsync(async (req, res, next) => {
  const user = await userService.createUser(req.body);

  // After user creation, generate verification token and send email
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false }); // Save token fields without re-validating password

  const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${verificationToken}`;
  const message = `Welcome to Napoleon! Please verify your account by clicking the link below:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`;

  await sendEmail({
    email: user.email,
    subject: 'Email Verification (Valid for 24h)',
    message,
  });

  // Log the user in immediately after creation
  const { token, user: loggedInUser } = await userService.authenticateUser(
    user.email,
    req.body.password,
  );

  createSendToken(user, 201, res);
});

/**
 * HTTP Handler for user login.
 */
export const loginHandler = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await userService.authenticateUser(email, password);

  // Set JWT in HttpOnly cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 90) *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    data: user,
  });
});
/**
 * HTTP Handler for forgot password.
 */
export const forgotPasswordHandler = catchAsync(async (req, res) => {
  // 1) Get user and generate reset token
  const resetToken = await userService.forgotPassword(req.body.email); // This service call also saves the hashed token to the user model

  // 2) Construct reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `You have requested a password reset. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.`;

  // 3) Send the email
  await sendEmail({
    email: req.body.email, // Assuming userService.forgotPassword found the user by this email
    subject: 'Your Password Reset Token (Valid for 10min)',
    message,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email!',
  });
});

/**
 * HTTP Handler for resetting password.
 */
export const resetPasswordHandler = catchAsync(async (req, res) => {
  const { user, token } = await userService.resetPassword(
    req.params.token,
    req.body.password,
  );

  // Set JWT in HttpOnly cookie so the user is logged in automatically
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 90) *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    data: user,
  });
});

/**
 * HTTP Handler to get the currently logged in user's profile.
 */
export const getMe = catchAsync(async (req, res) => {
  // req.user is already populated by the protect middleware
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * HTTP Handler for getting all users.
 */
export const getUsersHandler = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * HTTP Handler for getting a single user by ID.
 */
export const getUserHandler = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * HTTP Handler for updating a user.
 */
export const updateUserHandler = catchAsync(async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

/**
 * HTTP Handler for deleting a user.
 */
export const deleteUserHandler = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
