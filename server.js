// Load environment variables from .env.development if in development mode
const path = require('path');
const dotenvFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, dotenvFile) });

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const next = require('next');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const announcements = require('./routes/announcements');
const adminProfileRoutes = require('./routes/adminProfileRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const { isAuthenticated, isAdmin } = require('./middlewares/auth');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Middleware
    server.use(express.json());
    server.use(morgan('dev'));
    server.use(cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true, // Enable credentials to be sent with requests (cookies)
    }));

    // MongoDB Connection
    console.log('Connecting to MongoDB:', process.env.MONGODB_URI); // Log the MongoDB URI for debugging
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch((err) => console.error('MongoDB Connection Error:', err));

    // Session Configuration
    server.use(session({
        secret: process.env.SESSION_SECRET || 'default_secret_key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
        cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    }));

    // Routes
    server.use('/api/announcements', announcements);
    server.use('/api/admin', adminProfileRoutes);
    server.use('/api/user', userProfileRoutes);

    // Default handler for Next.js routes
    server.all('*', (req, res) => handle(req, res));

    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
});
