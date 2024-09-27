import bcrypt from 'bcrypt';
import User from '../../models/User';  // Ensure correct path to your User model
import connectDB from '../../utils/connectDB';
import { setCookie } from 'cookies-next'; // For cookie-based session management

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { usernameOrEmail, password } = req.body;

  // Validate input
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Both username/email and password are required.' });
  }

  try {
    // Ensure database connection
    await connectDB();

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

    // Set a secure session cookie with user info
    setCookie(
      'session',
      { userId: user._id, role: user.role }, // Do not store sensitive info like password
      { req, res, httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 } // 1 day expiration
    );

    // Respond with basic user info (exclude sensitive data like password)
    return res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      role: user.role, // Can be 'admin' or 'user' based on your logic
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
