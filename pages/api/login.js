import bcrypt from 'bcrypt';
import User from '../../models/User';  // Adjust path as necessary
import connectDB from '../../utils/connectDB';
import { setCookie } from 'cookies-next'; // To set cookies for session management

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Both username/email and password are required.' });
  }

  try {
    await connectDB();  // Ensure database connection

    // Find user by either email or username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

    // Set a session cookie
    setCookie('session', { userId: user._id, role: user.role }, { req, res, maxAge: 60 * 60 * 24 }); // 1 day expiration

    // Respond with user details (no token)
    return res.status(200).json({
      message: 'Login successful',
      role: user.role,
      userId: user._id,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
