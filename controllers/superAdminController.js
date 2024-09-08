const asyncHandler = require('express-async-handler');
const user = require('../models/Users');
const group = require('../models/Groups');
const test = require('../models/Tests');
const question = require('../models/Questions');
const performAnalytics = require ('../models/platformAnalytics');

//@Desc get qzplatform stats
//@Route GET /api/superadmin/stats
//@Access Public
const getplatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await user.countDocuments();
    const totalGroups = await group.countDocuments();
    const totalTests = await test.countDocuments();
    const totalQuestions = await question.countDocuments();
    const testTakers = await user.countDocuments({ role: 'testTaker' });
    const testCreators = await user.countDocuments({ role: 'testCreator' });
    const activeUsers = await user.countDocuments({ isActive: true });
    const inactiveUsers = await user.countDocuments({ isActive: false });

    //save all the analytics to database platformanalytics
    const analytics = new performAnalytics({
        totalUsers,
        totalGroups,
        totalTests,
        totalQuestions,
        activeUsers,
        inactiveUsers
    });

    res.status(200).json({ totalUsers, totalGroups, totalTests, totalQuestions });
});

//@Desc get all users
//@Route GET /api/superadmin/users
//@Access Public
const listAllUsers = asyncHandler(async (req, res) => {
    const users = await user.find().select('name email role isActive timestamp');
    res.status(200).json(users);
});

//@Desc Disable/enable user
//@Route PUT /api/superadmin/users/:userId
//@Access Public
const toggleUserStatus = syncHandler(async (req, res) => {
    const user = await user.findById(req.params.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ message: 'User status updated successfully', isActive: user.isActive });
});

//@Desc monthly user registration stats
//@Route GET /api/superadmin/users/user-flow
//@Access Public
const getMonthlyUserFlow = asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(currentYear, month, 1);
        const endOfMonth = new Date(currentYear, month + 1, 0);

        const newTestCreators = await User.countDocuments({
            role: 'testCreator',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const newTestTakers = await User.countDocuments({
            role: 'testTaker',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        monthlyData.push({
            month: month + 1, // 1-based month
            newTestCreators,
            newTestTakers
        });
    }

    res.json(monthlyData);
});


module.exports = { 
    getplatformStats,
    listAllUsers,
    toggleUserStatus,
    getMonthlyUserFlow
};