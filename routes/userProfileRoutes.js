const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

// Configure multer for file uploads (profile pictures)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pictures/'); // Ensure the directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Include the original name
  }
});

// File filter to allow only image uploads
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  
  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb('Error: Only image files are allowed (jpeg, jpg, png, gif)');
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size 10 MB
});

// View user profile
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

// Edit user profile (with profile picture upload)
router.put('/profile', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
  const { displayName, username, email, password, faculty, studentId, gender } = req.body;
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email is being updated and ensure uniqueness
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    // Check if username is being updated and ensure uniqueness
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

    // Handle profile picture upload
    if (req.file) {
      user.profilePicture = `/uploads/profile_pictures/${req.file.filename}`;
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
