const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Announcement = require('../models/Announcement'); // Assuming you have a Mongoose model for Announcement
const { isAuthenticated, isAdmin } = require('../middlewares/auth'); // Middleware for authentication and admin check

// Multer storage setup for cover images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save uploaded files to 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Name files with timestamp + extension
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10 MB
  },
});

// Admin creates an announcement with a cover image
router.post('/create', isAuthenticated, isAdmin, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const coverImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newAnnouncement = new Announcement({
      title,
      content,
      coverImage: coverImagePath,
      createdBy: req.session.userId,
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

// Admin edits an announcement
router.put('/edit/:id', isAuthenticated, isAdmin, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const updateData = { title, content };

    // Only update coverImage if a new image is uploaded
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error('Error editing announcement:', error);
    res.status(500).json({ message: 'Error editing announcement' });
  }
});

// Fetch all announcements (anyone can access)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }); // Fetch in descending order
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Admin deletes an announcement
router.delete('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Error deleting announcement' });
  }
});

module.exports = router;
