import mongoose from 'mongoose';

// Load environment variables (if necessary)
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Already connected to MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,  // Optional: Use the new URL parser
      useUnifiedTopology: true, // Optional: Use the new Server Discover and Monitoring engine
    };

    console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB Connected');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw new Error(`Failed to connect to MongoDB: ${err.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error; // Propagate the error for handling at a higher level
  }

  return cached.conn;
}

export default connectDB;
