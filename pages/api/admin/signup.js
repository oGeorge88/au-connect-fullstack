import bcrypt from 'bcrypt';
import User from '../../../models/User'; // Correct path for User model
import connectDB from '../../../utils/connectDB';  // Ensure database connection

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, email, password } = req.body;

    console.log("Admin Signup Request:", req.body);

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Ensure database connection
    try {
        await connectDB();
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({ message: 'Failed to connect to database' });
    }

    // Check for existing user to avoid duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(409).json({ message: 'Email or username already exists' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin',  // Set as 'admin' or 'user' based on your logic
        });

        await newUser.save();
        res.status(201).json({ message: 'Admin registered successfully', userId: newUser._id, role: newUser.role });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
