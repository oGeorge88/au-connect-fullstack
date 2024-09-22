const bcrypt = require('bcrypt');
const User = require('../../models/User');  // Ensure correct path to the User model
const connectDB = require('../../utils/connectDB');  // Ensure database connection

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { displayName, username, email, password, faculty, gender, studentId } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    await connectDB();  // Ensure database connection

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      displayName,
      username,
      email,
      password: hashedPassword,
      faculty,
      gender,
      studentId: studentId || null,  // Optional field
      role: 'user',
    });

    await newUser.save();

    // Respond with success message
    return res.status(201).json({
      userId: newUser._id,
      role: newUser.role,
      message: 'Signup successful!',
    });
  } catch (error) {
    console.error('Signup error:', error);  // This will show the error details in your server logs
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}
