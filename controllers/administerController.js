const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const User = require('../models/User');
const Group = require('../models/Group');
const { sendMail } = require('../utils/sendEmail');
const { generateRandomPassword } = require('../utils/generatePassword');
const bcrypt = require('bcryptjs');

// Validation middleware
const validateTestConfig = [
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    body('noEndDate').optional().isBoolean().withMessage('Invalid end date option'),
    body('timeLimit').optional().isString().withMessage('Invalid time limit format'),
    body('numberOfAttempts').optional().isInt({ min: 1 }).withMessage('Number of attempts must be a positive integer'),
    body('randomizeQuestions').optional().isBoolean().withMessage('Invalid randomize questions option'),
    body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    body('assignment').optional().isObject().withMessage('Invalid assignment data')
];

// Configuration and Administration Endpoint
router.post('/:testId/administer', validateTestConfig, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        startDate,
        endDate,
        noEndDate,
        timeLimit,
        numberOfAttempts,
        randomizeQuestions,
        passingScore,
        assignment
    } = req.body;

    const testId = req.params.testId;
    const now = new Date();
    const test = await Test.findById(testId);

    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Update test configuration
    test.startDate = startDate || test.startDate;
    test.endDate = endDate || test.endDate;
    test.noEndDate = noEndDate !== undefined ? noEndDate : test.noEndDate;
    test.timeLimit = timeLimit || test.timeLimit;
    test.numberOfAttempts = numberOfAttempts || test.numberOfAttempts;
    test.randomizeQuestions = randomizeQuestions !== undefined ? randomizeQuestions : test.randomizeQuestions;
    test.passingScore = passingScore || test.passingScore;

    // Determine and set status
    let status = 'draft';
    if (now >= new Date(test.startDate) && (!test.endDate || now <= new Date(test.endDate))) {
        status = 'active';
    } else if (test.endDate && now > new Date(test.endDate)) {
        status = 'completed';
    }
    test.status = status;

    try {
        await test.save();
    } catch (error) {
        console.error('Error Saving Test Configuration:', error);
        return res.status(500).json({ message: 'Failed to update test configuration', error });
    }

    // Handle manual assignment
    let assignedUsers = [];
    if (assignment) {
        if (assignment.manual) {
            // Manual Assignment to Individuals
            if (assignment.manual.individuals) {
                const users = await User.find({ email: { $in: assignment.manual.individuals } });
                assignedUsers = users.map(user => user._id);

                // Send email invitations to manually assigned users
                users.forEach(user => {
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: 'Test Assigned on QzPlatform',
                        html: `<p>You have been assigned a new test. Please log in to view and complete it.</p>`
                    };
                    sendMail(mailOptions);
                });
            }

            // Manual Assignment to Groups
            if (assignment.manual.groups) {
                const groups = await Group.find({ _id: { $in: assignment.manual.groups } });
                groups.forEach(group => {
                    assignedUsers = [...assignedUsers, ...group.members];
                });
            }
        }

        // Handle email invitations
        if (assignment.emailInvitations) {
            assignment.emailInvitations.forEach(async invite => {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: invite.email,
                    subject: 'Test Invitation',
                    html: `<p>You are invited to take a test. Please log in to view and complete it.</p>`
                };
                if (invite.scheduledTime) {
                    // Schedule email for later if needed
                } else {
                    sendMail(mailOptions);
                }
            });
        }

        // Handle link sharing
        if (assignment.linkSharing) {
            const testLink = `https://qzplatform.com/tests/${testId}`;
            if (assignment.linkSharing.public) {
                // Public link logic
            }

            if (assignment.linkSharing.restricted) {
                assignment.linkSharing.restricted.forEach(email => {
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: 'Test Link',
                        html: `<p>Here is your link to the test: <a href="${testLink}">${testLink}</a></p>`
                    };
                    sendMail(mailOptions);
                });
            }
        }
    }

    res.status(200).json({ message: 'Test configured and administered successfully', test });
}));

module.exports = router;
