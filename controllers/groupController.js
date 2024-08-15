const asyncHandler = require("express-async-handler");
const Group = require('../models/groups');
const User = require('../models/Users');

const createGroup = asyncHandler(async (req, res) => {
    const { groupName, groupDescription, memberEmails } = req.body;
    console.log("Request Body:", req.body);

    // Fetch existing test takers
    let members = await User.find({ email: { $in: memberEmails }, role: 'testTaker' });
    console.log("Existing Test Takers Found:", members);

    // Fetch all users with the provided emails
    let allUsers = await User.find({ email: { $in: memberEmails } });
    console.log("All Users Found:", allUsers);

    const existingEmails = allUsers.map(user => user.email);
    const existingTestTakersEmails = members.map(user => user.email);
    
    // Identify new emails that are not yet in the system
    const newEmails = memberEmails.filter(email => !existingEmails.includes(email));
    console.log("New Emails to be Added:", newEmails);

    const newUsers = newEmails.map(email => ({
        name: email.split('@')[0],
        email: email,
        password: 'defaultPassword123', // Consider using a hashed password here
        role: 'testTaker'
    }));

    let createdUsers = [];
    if (newUsers.length > 0) {
        try {
            createdUsers = await User.insertMany(newUsers);
            console.log("New Users Created Successfully:", createdUsers);
        } catch (error) {
            console.error("Error Creating New Users:", error);
            return res.status(500).json({ message: "Failed to create new users", error });
        }
    }

    // Combine the old and new members
    members = [...members, ...createdUsers];
    console.log("Final Group Members:", members);

    // Create the group
    const group = new Group({
        groupName,
        groupDescription,
        members: members.map(user => user._id)
    });

    try {
        await group.save();
        console.log("Group Created Successfully:", group);
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error("Error Saving Group:", error);
        res.status(500).json({ message: "Failed to create group", error });
    }
});


const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find().populate('members', 'fullName email');
    res.status(200).json(groups);
});

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

    // Find the group by ID
    let group = await Group.findById(req.params.groupId);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
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
        const newUsers = validEmails.map(email => ({
            name: email.split('@')[0], // Assuming your schema uses `name`
            fullName: email.split('@')[0], // Change to `name` if your schema requires it
            email: email,
            password: 'defaultPassword123',
            role: 'testTaker'
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
});

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
