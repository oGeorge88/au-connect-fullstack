// middlewares/auth.js

// Authentication middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = { _id: req.session.userId, role: req.session.role }; // Attach user details to req.user
    return next(); // Proceed to the next middleware or route handler
  } else {
    return res.status(401).json({ message: 'Unauthorized: Please log in first.' }); // If no session, send 401 Unauthorized
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.role === 'admin') {
    return next(); // Proceed if the user is an admin
  } else {
    return res.status(403).json({ message: 'Forbidden: Admins only.' }); // Send 403 Forbidden if not an admin
  }
};

module.exports = { isAuthenticated, isAdmin };
