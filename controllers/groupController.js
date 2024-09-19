const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Group = require('../models/groups');
const User = require('../models/Users');
const { sendMail } = require('../utils/sendEmail');
const { generateRandomPassword } = require('../utils/generatePassword');

// @Desc Create a Group
// @route POST /api/groups/
// @access public
const createGroup = [
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

        // Fetch all users by provided emails
        let allUsers = await User.find({ email: { $in: memberEmails } });
        const existingEmails = allUsers.map(user => user.email);
        const invalidEmails = allUsers.filter(user => user.role !== 'testTaker').map(user => user.email);

        if (invalidEmails.length > 0) {
            return res.status(400).json({
                message: `The following emails do not belong to a TestTaker: ${invalidEmails.join(', ')}`
            });
        }

        const newEmails = memberEmails.filter(email => !existingEmails.includes(email));
        const newUsers = await Promise.all(newEmails.map(async (email) => {
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            return {
                name: email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'testTaker',
                plainPassword: randomPassword
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

        const members = [...allUsers, ...createdUsers];
        const group = new Group({
            groupName,
            groupDescription,
            members: members.map(user => user._id)
        });

        try {
            await group.save();
            res.status(201).json({ message: 'Group created successfully', group, newMembers: createdUsers });

            createdUsers.forEach(user => {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'You Have Been Added to a New Course Group on QzPlatform',
                    html: `
                        <p>Dear ${user.name},</p>
                        <p>You have been added to the group "<strong>${groupName}</strong>" on QzPlatform.</p>
                        <p>Your temporary login credentials are:</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Password:</strong> ${user.plainPassword}</p>
                        <p>For security reasons, we recommend that you change your password immediately.</p>
                        <p>Best regards,<br>
                        <strong>The QzPlatform Team</strong></p>
                    `
                };
                sendMail(mailOptions);
            });

            allUsers.forEach(user => {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'Reminder: Log In to Your QzPlatform Group',
                    html: `
                        <p>Dear ${user.name},</p>
                        <p>You are a member of the group "<strong>${groupName}</strong>" on QzPlatform.</p>
                        <p>Please log in using your existing credentials.</p>
                        <p>Best regards,<br>
                        <strong>The QzPlatform Team</strong></p>
                    `
                };
                sendMail(mailOptions);
            });
        } catch (error) {
            console.error("Error Saving Group:", error);
            res.status(500).json({ message: "Failed to create group", error });
        }
    })
];

// @Desc Get all Groups
// @route GET /api/groups
// @access public
const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find().populate('members', 'fullName email');
    res.status(200).json(groups);
});

// @Desc Get a group by Id
// @route GET /api/groups/:groupId
// @access public
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId).populate('members', 'fullName email');
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(group);
});

// @Desc Update a group
// @route PUT /api/groups/:groupId
// @access public
const updateGroup = asyncHandler(async (req, res) => {
    const { groupName, groupDescription, memberEmails } = req.body;

    let group = await Group.findById(req.params.groupId).populate('members', 'email');
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    if (groupName) group.groupName = groupName;
    if (groupDescription) group.groupDescription = groupDescription;

    if (memberEmails) {
        let allUsers = await User.find({ email: { $in: memberEmails } });
        const existingGroupMemberEmails = group.members.map(member => member.email);
        const newEmails = memberEmails.filter(email => !existingGroupMemberEmails.includes(email));

        const existingEmailsNotInGroup = allUsers
            .filter(user => !existingGroupMemberEmails.includes(user.email))
            .map(user => user.email);

        const emailsToCreate = newEmails.filter(email => !existingEmailsNotInGroup.includes(email));

        const newUsers = await Promise.all(emailsToCreate.map(async (email) => {
            const plainPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            return {
                name: email.split('@')[0],
                fullName: email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'testTaker',
                plainPassword,
            };
        }));

        let createdUsers = [];
        if (newUsers.length > 0) {
            try {
                createdUsers = await User.insertMany(newUsers);
            } catch (error) {
                console.error('Error Creating New Users:', error);
                return res.status(500).json({ message: 'Failed to create new users', error });
            }
        }

        const updatedMemberIds = [
            ...group.members.filter(member => memberEmails.includes(member.email)).map(member => member._id),
            ...createdUsers.map(user => user._id),
            ...allUsers.filter(user => existingEmailsNotInGroup.includes(user.email)).map(user => user._id)
        ];

        group.members = updatedMemberIds;
    }

    try {
        await group.save();
        res.status(200).json({ message: 'Group updated successfully', group });

        if (createdUsers.length > 0) {
            createdUsers.forEach(user => {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'You Have Been Added to a New Group on QzPlatform',
                    html: `
                        <p>Dear ${user.name},</p>
                        <p>You have been added to the group "<strong>${group.groupName}</strong>" on QzPlatform.</p>
                        <p>Your login credentials are:</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Password:</strong> ${user.plainPassword}</p>
                        <p>For security reasons, we recommend that you change your password immediately.</p>
                        <p>Best regards,<br>
                        <strong>The QzPlatform Team</strong></p>
                    `
                };
                sendMail(mailOptions);
            });
        }
    } catch (error) {
        console.error("Error updating group:", error);
        res.status(500).json({ message: 'Failed to update group', error });
    }
});

// @Desc Delete a group
// @route DELETE /api/groups/:groupId
// @access public
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findByIdAndDelete(req.params.groupId);
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
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
