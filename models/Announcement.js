const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters long'],
  },
  coverImage: {
    type: String, // Cover Image URL
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookmarkedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  }], // Users who bookmarked this announcement
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Adding an index on createdAt for faster queries
  },
});

// Index for better query performance on createdBy
announcementSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
