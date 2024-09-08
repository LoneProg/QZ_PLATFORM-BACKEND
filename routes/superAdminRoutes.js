const express = require('express');
const router = express.Router();
const { 
    getplatformStats, 
    listAllUsers, 
    toggleUserStatus, 
    getMonthlyUserFlow 
} = require('../controllers/superAdminController');

// Middleware for authentication and role checking
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Route to Get platform statistics
router.get('/stats', protect, isAdmin, getplatformStats);

// route to Get all users with pagination
router.get('/users', protect, isAdmin, listAllUsers);

// Route Toggle user status
router.put('/users/:userId', protect, isAdmin, toggleUserStatus);

//Rpute to Get monthly user registration stats
router.get('/users/user-flow', protect, isAdmin, getMonthlyUserFlow);

module.exports = router;
