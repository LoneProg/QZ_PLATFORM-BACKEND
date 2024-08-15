const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Group = require('../models/groups');
const User = require('../models/Users');

// @Desc    Create a Group
// @route   POST /api/groups/
// @access  public
const createGroup = [
    // Input validation
    body('groupName').not().isEmpty().withMessage('Group name is required'),
    body('memberEmails').isArray().withMessage('Member emails should be an array'),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { groupName, groupDescription, memberEmails } = req.body;

        // Check if the group already exists
        const existingGroup = await Group.findOne({ groupName });
        if (existingGroup) {
            return res.status(400).json({ message: 'Group with this name already exists' });
        }

        // Fetch existing test takers
        let members = await User.find({ email: { $in: memberEmails }, role: 'testTaker' });

        // Find all users by provided emails
        let allUsers = await User.find({ email: { $in: memberEmails } });

        const existingEmails = allUsers.map(user => user.email);

        // Identify new emails that are not yet in the system
        const newEmails = memberEmails.filter(email => !existingEmails.includes(email));

        // Create new users for new emails
        const newUsers = await Promise.all(newEmails.map(async (email) => {
            const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
            return {
                name: email.split('@')[0],
                fullName: email.split('@')[0],
                email: email,
                password: hashedPassword,
                role: 'testTaker'
            };
        }));

        let createdUsers = [];
        if (newUsers.length > 0) {
            try {
                createdUsers = await User.insertMany(newUsers);
            } catch (error) {
                console.error("Error Creating New Users:", error);
                return res.status(500).json({ message: "Failed to create new users", error });
            }
        }

        // Combine existing and new members
        members = [...members, ...createdUsers];

        // Create the group
        const group = new Group({
            groupName,
            groupDescription,
            members: members.map(user => user._id)
        });

        try {
            await group.save();
            res.status(201).json({ message: 'Group created successfully', group, newMembers: createdUsers });
        } catch (error) {
            console.error("Error Saving Group:", error);
            res.status(500).json({ message: "Failed to create group", error });
        }
    })
];

// @Desc    Get all Groups
// @route   GET /api/groups
// @access  public
const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find().populate('members', 'fullName email');
    res.status(200).json(groups);
});

// @Desc    Get a group by Id
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
const updateGroup = [
    // Input validation
    body('groupName').optional().not().isEmpty().withMessage('Group name is required if provided'),
    body('memberEmails').optional().isArray().withMessage('Member emails should be an array if provided'),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { groupName, groupDescription, memberEmails } = req.body;

        // Find the group by ID
        let group = await Group.findById(req.params.groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Check for duplicate group names
        if (groupName && groupName !== group.groupName) {
            const existingGroup = await Group.findOne({ groupName });
            if (existingGroup) {
                return res.status(400).json({ message: 'Group with this name already exists' });
            }
        }

        // Update group details if provided
        if (groupName) group.groupName = groupName;
        if (groupDescription) group.groupDescription = groupDescription;

        // Process member emails if provided
        if (memberEmails) {
            // Find existing users by email
            let allUsers = await User.find({ email: { $in: memberEmails } });
            let existingMembers = allUsers.filter(user => user.role === 'testTaker');

            // Map to get emails of existing members
            const existingEmails = existingMembers.map(user => user.email);

            // Find new emails that need to be added
            const newEmails = memberEmails.filter(email => !existingEmails.includes(email));

            // Validate new emails to ensure they are not already in use by admins or test creators
            const validEmails = newEmails.filter(email => {
                const user = allUsers.find(user => user.email === email);
                return !user || user.role === 'testTaker';
            });

            // Create new users for valid new emails
            const newUsers = await Promise.all(validEmails.map(async (email) => {
                const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
                return {
                    name: email.split('@')[0], // Assuming your schema uses `name`
                    fullName: email.split('@')[0], // Change to `name` if your schema requires it
                    email: email,
                    password: hashedPassword,
                    role: 'testTaker'
                };
            }));

            let createdUsers = [];
            if (newUsers.length > 0) {
                try {
                    createdUsers = await User.insertMany(newUsers);
                } catch (error) {
                    console.error('Error Creating New Users:', error);
                    return res.status(400).json({ message: 'Failed to create new users', error });
                }
            }

            // Update the group members
            group.members = [...existingMembers.map(user => user._id), ...createdUsers.map(user => user._id)];
        }

        // Save the updated group
        await group.save();
        res.status(200).json({ message: 'Group updated successfully', group });
    })
];

// @Desc    Delete a group
// @route   DELETE /api/groups/:groupId
// @access  public
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
