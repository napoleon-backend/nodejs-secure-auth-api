import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to handle validation results.
 * If errors exist, it passes a formatted error to the global error handler.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors
    .array()
    .map((err) => `${err.path}: ${err.msg}`);
  const error = new Error(extractedErrors.join('. '));
  error.statusCode = 400;
  return next(error);
};

/**
 * Validation rules for creating a user
 */
export const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  handleValidation,
];

/**
 * Validation rules for updating a user
 */
export const validateUpdateUser = [
  param('id').isMongoId().withMessage('Invalid User ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidation,
];

/**
 * Validation rules for routes requiring a Mongo ID param
 */
export const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid User ID format'),
  handleValidation,
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

/**
 * Validation rules for forgot password
 */
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidation,
];

/**
 * Validation rules for reset password
 */
export const validateResetPassword = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  handleValidation,
];
