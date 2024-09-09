const asyncHandler = require('express-async-handler');
const User = require('../models/Users');
const Group = require('../models/groups');
const Test = require('../models/tests');
const Question = require('../models/questions');
const platformAnalytics = require('../models/platformAnalytics');

//@Desc get qzplatform stats
//@Route GET /api/superadmin/stats
//@Access Private (Super Admin only)
const getPlatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const testTakers = await User.countDocuments({ role: 'testTaker' });
    const testCreators = await User.countDocuments({ role: 'testCreator' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Save analytics to the database
    const analytics = new PlatformAnalytics({
        totalUsers,
        totalGroups,
        totalTests,
        totalQuestions,
        activeUsers,
        inactiveUsers,
        message: 'Analytics saved successfully'
    });
    await analytics.save();

    res.status(200).json({
        totalUsers,
        totalGroups,
        totalTests,
        totalQuestions,
        testTakers,
        testCreators,
        activeUsers,
        inactiveUsers,
        message: 'Platform statistics retrieved successfully'
    });
});

//@Desc get all users with pagination
//@Route GET /api/superadmin/users
//@Access Private (Super Admin only)
const listAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('name email role isActive timestamp')
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
        users,
        page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
    });
});

//@Desc Disable/enable user status
//@Route PUT /api/superadmin/users/:userId
//@Access Private (Super Admin only)
const toggleUserStatus = asyncHandler(async (req, res) => {
    const foundUser = await User.findById(req.params.userId);
    if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if requester is Super Admin
    if (!req.user.isSuperAdmin) {
        return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
    
    // Toggle user status
    foundUser.isActive = !foundUser.isActive;
    await foundUser.save();

    res.status(200).json({
        message: `User status updated successfully`,
        isActive: foundUser.isActive
    });
});

//@Desc monthly user registration stats
//@Route GET /api/superadmin/users/user-flow
//@Access Private (Super Admin only)
const getMonthlyUserFlow = asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();

    const userFlow = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lte: new Date(`${currentYear}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' }, role: '$role' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.month': 1 }  // Sort by month
        }
    ]);

    res.status(200).json(userFlow);
});

module.exports = {
    getPlatformStats,
    listAllUsers,
    toggleUserStatus,
    getMonthlyUserFlow
};
