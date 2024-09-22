const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, return early
  if (mongoose.connection.readyState) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

module.exports = connectDB;
