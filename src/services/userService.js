import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../model/userModel.js";
import sendEmail from "../utils/email.js";

/**
 * Creates a new user in the database.
 * @param {Object} userData - Data for the new user.
 * @returns {Promise<Object>} The created user document.
 * @throws {Error} If the email is already registered.
 */
export const createUser = async (userData, protocol, host) => {
  // 1. Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // 2. Create the user instance in memory first (or via your schema constructor)
  // This allows us to generate the token BEFORE saving to the DB a single time.
  const user = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    // ... any other fields
  });

  // 3. Generate verification token (mutates the user object in memory)
  const verificationToken = user.createEmailVerificationToken();

  // 4. Save to the database ONCE
  await user.save();

  // 5. Construct verification URL
  const verifyUrl = `${protocol}://${host}/api/v1/users/verify-email/${verificationToken}`;
  const message = `Welcome to Napoleon! Please verify your account by clicking the link below:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`;

  sendEmail({
    email: user.email,
    subject: "Email Verification (Valid for 24h)",
    message,
  }).catch((err) => {
    console.error("Email failed to send in background:", err);
  });

  // 6. Log the user in immediately (Using the user we already have)
  const { token, user: loggedInUser } = await authenticateUser(
    user.email,
    userData.password,
  );

  return { token, user: loggedInUser };
};

/**
 * Authenticates a user and generates a JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Object containing token and user document.
 */
export const authenticateUser = async (email, password) => {
  // 1) Check if user exists & password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Incorrect email or password");
    error.statusCode = 401;
    throw error;
  }

  // 2) Generate Token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });

  user.password = undefined; // Remove password from output
  user.isVerified = undefined; // Remove isVerified from output for login response
  return { token, user };
};

/**
 * Generates a password reset token for a user.
 * @param {string} email
 * @returns {Promise<string>} The unhashed reset token.
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("There is no user with that email address.");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

/**
 * Resets user password using a valid token.
 * @param {string} token - The plain text token from the URL.
 * @param {string} password - New password.
 */
export const resetPassword = async (token, password) => {
  // 1) Hash the token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2) Find user with valid token and not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token is invalid or has expired.");
  }

  // 3) Update password and clear reset fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.isVerified = true; // Auto-verify on password reset
  user.passwordResetExpires = undefined;
  await user.save();

  return { user };
};

/**
 * Retrieves all users from the database.
 * @returns {Promise<Array>} List of all user documents.
 */
export const getAllUsers = async () => {
  return await User.find();
};

/**
 * Finds a user by their unique ID.
 * @param {string} id - The MongoDB ObjectId of the user.
 * @returns {Promise<Object>} The user document.
 * @throws {Error} If the user is not found.
 */
export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Updates a user document.
 * Security Requirement: Fetches document first and calls .save() to trigger pre-save hooks.
 * @param {string} id - The user ID.
 * @param {Object} updateData - Key-value pairs to update.
 * @returns {Promise<Object>} The updated user document.
 * @throws {Error} If user is not found.
 */
export const updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Explicitly assign keys to the document instance
  Object.keys(updateData).forEach((key) => {
    user[key] = updateData[key];
  });

  // .save() ensures pre-save middleware (e.g., password hashing) executes
  await user.save();
  return user;
};

/**
 * Deletes a user by ID.
 * @param {string} id - The user ID.
 * @returns {Promise<Object>} The deleted user document.
 * @throws {Error} If user is not found.
 */
export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
