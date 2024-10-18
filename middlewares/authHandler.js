// JWT Token Verification Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Protect middleware (verifies JWT and populates req.user)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired, please log in again' });
            }
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Role-based access middleware for Test Creators
const testCreatorOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.role !== 'testCreator') {
        return res.status(403).json({ message: 'Access restricted to Test Creators only' });
    }

    next();
};

// Apply the middleware to a route
router.route('/').get(protect, testCreatorOnly, getUsers);
