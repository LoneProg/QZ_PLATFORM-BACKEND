const asyncHandler = require("express-async-handler");
const User = require('../models/Users');
const Group = require('../models/groups');

// @Desc    Create a new group
// @route   POST /api/groups
// @access  Public
const createGroup = asyncHandler(async (req, res) => {
    const { groupName, groupDescription, memberEmails } = req.body;

    // Find Test Takers by email
    let members = await User.find({ email: { $in: memberEmails }, role: 'testTaker' });

    // Find all existing users with the provided emails
    let allUsers = await User.find({ email: { $in: memberEmails } });

    // Determine which emails are new and should be added
    const existingEmails = allUsers.map(user => user.email);
    const existingTestTakersEmails = members.map(user => user.email);
    const newEmails = memberEmails.filter(email => !existingEmails.includes(email));
    const validEmails = newEmails.filter(email => {
        const user = allUsers.find(user => user.email === email);
        return !user || user.role === 'testTaker';
    });

    const newUsers = validEmails.map(email => ({
        fullName: email.split('@')[0],
        email: email,
        password: 'defaultPassword123',
        role: 'testTaker'
    }));

    const createdUsers = await User.insertMany(newUsers);

    members = [...members, ...createdUsers];

    // Create group with members
    const group = new Group({
        groupName,
        groupDescription,
        members: members.map(user => user._id)
    });

    await group.save();

    res.status(201).json({ message: 'Group created successfully', group });
});


// @Desc    Get all groups
// @route   GET /api/groups
// @access  public
const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find().populate('members', 'fullName email');
    res.status(200).json(groups);
});

// @Desc    Get group by ID
// @route   GET /api/groups/:groupId
// @access  public
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId).populate('members', 'fullName email');
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }
    res.status(200).json(group);
});

// @Desc    Update a group
// @route   PUT /api/groups/:groupId
// @access  public
const updateGroup = asyncHandler(async (req, res) => {
    const { groupName, groupDescription, memberEmails } = req.body;

    let group = await Group.findById(req.params.groupId);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    // Update group details
    if (groupName) group.groupName = groupName;
    if (groupDescription) group.groupDescription = groupDescription;

    if (memberEmails) {
        let allUsers = await User.find({ email: { $in: memberEmails } });
        let members = allUsers.filter(user => user.role === 'testTaker');
        const existingEmails = members.map(user => user.email);
        const newEmails = memberEmails.filter(email => !existingEmails.includes(email));

        const validEmails = newEmails.filter(email => {
            const user = allUsers.find(user => user.email === email);
            return !user || user.role === 'testTaker';
        });

        const newUsers = validEmails.map(email => ({
            fullName: email.split('@')[0],
            email: email,
            password: 'defaultPassword123',
            role: 'testTaker'
        }));

        const createdUsers = await User.insertMany(newUsers);

        members = [...members, ...createdUsers];
        group.members = members.map(user => user._id);
    }

    await group.save();
    res.status(200).json({ message: 'Group updated successfully', group });
});


// @Desc    Delete a group
// @route   DELETE /api/groups/:groupId
// @access  Private
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findByIdAndDelete(req.params.groupId);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }
    res.status(200).json({ message: 'Group deleted successfully' });
});

module.exports = {
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup
};
