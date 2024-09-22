const bcrypt = require('bcrypt');
const User = require('../../models/User');
const connectDB = require('../../utils/connectDB');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Username or email and password are required' });
    }

    try {
        await connectDB();
        const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username/email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username/email or password' });
        }

        // Set session with userId and role
        req.session.userId = user._id;
        req.session.role = user.role;

        return res.status(200).json({ message: 'Login successful!', role: user.role, userId: user._id });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}
