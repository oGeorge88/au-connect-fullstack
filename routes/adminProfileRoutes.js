const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const router = express.Router();

// View all users (Admin only)
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from response
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new user (Admin only)
router.post('/users', isAuthenticated, isAdmin, async (req, res) => {
  const { displayName, username, email, password, faculty, gender, studentId } = req.body;

  // Validate required fields
  if (!displayName || !username || !email || !password || !faculty || !gender) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if email or username is already taken
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      displayName,
      username,
      email,
      password: hashedPassword,
      faculty,
      gender,
      studentId,
    });

    await user.save();

    // Respond with user data, excluding the password
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ message: 'User created successfully', user: userData });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit user (Admin only)
router.put('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  const { displayName, username, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the new username is taken by another user
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      user.username = username;
    }

    // Update display name if provided
    user.displayName = displayName || user.displayName;

    // If password is provided, hash and update it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    // Respond with updated user data
    const { password: _, ...updatedUserData } = user.toObject();
    res.status(200).json({ message: 'User updated successfully', user: updatedUserData });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
