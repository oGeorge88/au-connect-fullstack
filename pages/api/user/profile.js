const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../../../models/User'); // Correct path to your User model
const { isAuthenticated } = require('../../../middlewares/auth'); // Correct path to your auth middleware
const router = express.Router();

// View user profile (Session-based authentication)
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit user profile (Session-based authentication)
router.put('/profile', isAuthenticated, async (req, res) => {
  const { displayName, username, email, password, faculty, studentId, gender } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email is being updated and is unique
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    // Check if username is being updated and is unique
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username is already in use' });
      }
      user.username = username;
    }

    // Update non-sensitive fields
    user.displayName = displayName || user.displayName;
    user.faculty = faculty || user.faculty;
    user.studentId = studentId || user.studentId;
    user.gender = gender || user.gender;

    // If password is provided, hash and update it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    const updatedUser = await User.findById(req.session.userId).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
