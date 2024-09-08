const asyncHandler = require('express-async-handler');
const user = require('../models/Users');
const group = require('../models/Groups');
const test = require('../models/Tests');
const question = require('../models/Questions');

//@Desc get qzplatform stats
//@Route GET /api/superadmin/stats
//@Access Public
const getplatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await user.countDocuments();
    const totalGroups = await group.countDocuments();
    const totalTests = await test.countDocuments();
    const totalQuestions = await question.countDocuments();

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
const monthlyUserFlow = asyncHandler(async (req, res) => {
    const userFlow - await user.aggregate([
        {
            $group: {
                _id: { $month: '$timestamp' },
                count: { $sum: 1 }
            }
        },
        { $sort: {"id.year": 1, "_id.month": 1} }
    ]);
    res.status(200).json(userFlow);
});

module.exports = { getplatformStats };