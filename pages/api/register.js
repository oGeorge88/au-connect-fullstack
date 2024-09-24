import bcrypt from 'bcryptjs';
import User from '../../models/User'; // Make sure this is the correct path to your User model

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, email, password } = req.body;

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
            role: 'admin'  // Set as 'admin' or 'user' based on your logic
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id, role: newUser.role });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
