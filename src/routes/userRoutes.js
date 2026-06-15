import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateMongoId,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../services/userValidation.js';

const router = express.Router();

// Public routes
router.post('/', validateCreateUser, userController.createUserHandler); // User registration
router.post('/login', validateLogin, userController.loginHandler); // User login
router.get('/verify-email/:token', authController.verifyEmail);
router.post(
  '/forgotPassword',
  validateForgotPassword,
  userController.forgotPasswordHandler,
);
router.patch(
  '/resetPassword/:token',
  validateResetPassword,
  userController.resetPasswordHandler,
);

// Protect all routes defined below this middleware
router.use(protect);

// Session persistence route
router.get('/me', userController.getMe);

// Routes for /api/v1/users
router.route('/').get(userController.getUsersHandler);

// Routes for /api/v1/users/:id
router
  .route('/:id')
  .get(validateMongoId, userController.getUserHandler)
  .patch(validateUpdateUser, userController.updateUserHandler)
  .delete(validateMongoId, userController.deleteUserHandler);

export default router;
