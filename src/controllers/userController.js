import * as userService from "../services/userService.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/email.js";
import { createSendToken } from "./authController.js";

/**
 * HTTP Handler for creating a user.
 */
export const createUserHandler = catchAsync(async (req, res, next) => {
  const { token, user } = await userService.createUser(
    req.body,
    req.protocol,
    req.get("host"),
  );

  createSendToken(user, 201, res);
});

/**
 * HTTP Handler for user login.
 */
export const loginHandler = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user } = await userService.authenticateUser(email, password);

  createSendToken(user, 200, res);
});
/**
 * HTTP Handler for forgot password.
 */
export const forgotPasswordHandler = catchAsync(async (req, res) => {
  // 1) Get user and generate reset token
  const resetToken = await userService.forgotPassword(req.body.email); // This service call also saves the hashed token to the user model

  // 2) Construct reset URL
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `You have requested a password reset. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.`;

  // 3) Send the email
  await sendEmail({
    email: req.body.email, // Assuming userService.forgotPassword found the user by this email
    subject: "Your Password Reset Token (Valid for 10min)",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Password reset link sent to your email!",
  });
});

/**
 * HTTP Handler for resetting password.
 */
export const resetPasswordHandler = catchAsync(async (req, res) => {
  const { user } = await userService.resetPassword(
    req.params.token,
    req.body.password,
  );

  createSendToken(user, 200, res);
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
    message: "User deleted successfully",
  });
});
