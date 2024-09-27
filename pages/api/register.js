import bcrypt from 'bcryptjs';
import User from '../../models/User'; // Correct path to the User model
import connectDB from '../../utils/connectDB'; // Ensure connection to the database

export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // Email format validation (optional, but recommended)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        // Ensure database connection
        await connectDB();

        // Check for existing user to avoid duplicates
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email or username already exists.' });
        }

        // Hash the password with bcrypt
        const salt = await bcrypt.genSalt(12); // Using a higher salt rounds for stronger security
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user (default role set to admin)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin',  // Adjust based on your role system
        });

        // Save the user in the database
        await newUser.save();

        // Respond with success message and user data, omitting the password
        return res.status(201).json({ 
            message: 'User registered successfully', 
            userId: newUser._id, 
            role: newUser.role 
        });
    } catch (error) {
        console.error('Registration error:', error); // Log detailed error
        return res.status(500).json({ message: 'Internal server error.' });
    }
}
