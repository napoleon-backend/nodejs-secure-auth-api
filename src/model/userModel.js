import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// The user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      // Standard regex for basic email validation
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Prevents password from being returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    // Automatically creates 'createdAt' and 'updatedAt' fields
    timestamps: true,
  },
);

/**
 * Pre-save Middleware
 * Hashes the password before saving it to the database but if the password field was not modified, it will skip this process automatically
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Instance Method: comparePassword
 * This compares the entered password and the entered password in the case of login in or any function that needs this feature
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generates a random reset token, hashes it, and sets expiry.
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

/**
 * Generates a random email verification token, hashes it, and sets expiry.
 */
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

const User = mongoose.model('User', userSchema);

export default User;
