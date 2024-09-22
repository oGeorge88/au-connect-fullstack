const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    minlength: [2, 'Faculty must be at least 2 characters long'],
    maxlength: [100, 'Faculty cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    minlength: [3, 'Role must be at least 3 characters long'],
    maxlength: [50, 'Role cannot exceed 50 characters']
  },
  department: {
    type: String,
    maxlength: [100, 'Department cannot exceed 100 characters'], // Optional with maxlength
    default: null
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Optional with validation for format
    maxlength: [100, 'Email cannot exceed 100 characters'],
    default: null
  },
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'], // Optional with validation for phone format (E.164 format)
    default: null
  },
  facebook: {
    type: String,
    maxlength: [100, 'Facebook link cannot exceed 100 characters'], // Optional
    default: null
  },
  line: {
    type: String,
    maxlength: [100, 'Line ID cannot exceed 100 characters'], // Optional
    default: null
  },
  profilePicture: {
    type: String, // URL to profile picture (Optional)
    default: null
  }
});

// Adding an index on frequently queried fields
contactSchema.index({ name: 1, faculty: 1, role: 1 });

module.exports = mongoose.model('Contact', contactSchema);
