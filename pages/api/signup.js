import bcrypt from 'bcrypt';
import User from '../../models/User';  // Ensure the correct path to the User model
import connectDB from '../../utils/connectDB';  // Ensure database connection

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { displayName, username, email, password, faculty, gender, studentId } = req.body;

  // Log the incoming request for debugging purposes
  console.log("Signup Request:", req.body);

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Validate password strength (optional but recommended)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password should be at least 6 characters long.' });
  }

  try {
    await connectDB();  // Ensure database connection

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    // Hash the password before saving the user (with higher salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user
    const newUser = new User({
      displayName,
      username,
      email,
      password: hashedPassword,
      faculty,
      gender,
      studentId: studentId || null,  // Optional field
      role: 'user',  // Default to 'user' role, change based on your logic
    });

    await newUser.save();

    // Respond with success message (omit password from response)
    return res.status(201).json({
      userId: newUser._id,
      role: newUser.role,
      message: 'Signup successful!',
    });
  } catch (error) {
    console.error('Signup error:', error);  // Log error details for debugging
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}
