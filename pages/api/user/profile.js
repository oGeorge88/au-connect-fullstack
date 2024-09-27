import bcrypt from 'bcrypt';
import User from '../../../models/User'; // Ensure correct path to the User model
import connectDB from '../../../utils/connectDB'; // Utility to connect to MongoDB
import { getSession } from 'next-auth/react'; // Assuming you're using next-auth for session management

// API Route Handler
export default async function handler(req, res) {
  // Connect to the database
  await connectDB();

  // Get the session
  const session = await getSession({ req });

  // Only allow authenticated users
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { method } = req;

  // GET Request: Fetch user profile
  if (method === 'GET') {
    try {
      const user = await User.findById(session.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT Request: Update user profile
  else if (method === 'PUT') {
    const { displayName, username, email, password, faculty, studentId, gender } = req.body;

    try {
      const user = await User.findById(session.user.id);
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

      // Update other fields
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
      const updatedUser = await User.findById(session.user.id).select('-password');

      return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  } 

  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}
