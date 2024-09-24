const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// User schema definition with validation
const UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    maxlength: [100, 'Display name cannot exceed 100 characters'],
    default: null,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    maxlength: [100, 'Email cannot exceed 100 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  faculty: {
    type: String,
    maxlength: [100, 'Faculty name cannot exceed 100 characters'],
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null,
  },
  studentId: {
    type: String,
    maxlength: [50, 'Student ID cannot exceed 50 characters'],
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password is not modified

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass error to next middleware
  }
});

// Method to compare the entered password with the hashed password in the database
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Use the existing model if already created to avoid overwriting
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
