const asyncHandler = require("express-async-handler");
const Test = require('../models/tests');
const express = require('express');
//const User = require('../models/User');
//const Group = require('../models/Group');
const { sendMail } = require('../utils/sendEmail');
const { generateSharableLink } = require('../utils/generateSharebleLink'); // Updated utility
const { generateRandomPassword} = require('../utils/generatePassowrd');

// @Desc    Configure and administer a test
// @route   POST /api/tests/:testId/administer
// @access  public
const administerTest = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const {
        scheduling,
        timeAndAttempts,
        configuration,
        proctoring,
        assignment,
    } = req.body;

    // Find the test by ID
    const test = await Test.findById(testId);
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Apply scheduling settings
    if (scheduling) {
        test.scheduling = {
            ...test.scheduling,
            ...scheduling,
            status: scheduling.endDate ? 'scheduled' : 'active'
        };
    }

    // Apply time and attempts settings
    if (timeAndAttempts) {
        test.timeAndAttempts = {
            ...test.timeAndAttempts,
            ...timeAndAttempts
        };
    }

    // Apply test configuration settings
    if (configuration) {
        test.configuration = {
            ...test.configuration,
            ...configuration
        };

        // Generate a new access code using your utility function
        if (!test.configuration.accessCode) {
            test.configuration.accessCode = generateRandomPassword(6);
        }
    }

    // Apply proctoring settings
    if (proctoring) {
        test.proctoring = {
            ...test.proctoring,
            ...proctoring
        };
    }

    // Apply assignment settings
    if (assignment) {
        // Handle manual assignment for individual users and groups
        if (assignment.method === 'manual') {
            test.assignment.method = 'manual';
            if (assignment.manualAssignment) {
                if (assignment.manualAssignment.individualUsers) {
                    test.assignment.manualAssignment = {
                        ...test.assignment.manualAssignment,
                        individualUsers: assignment.manualAssignment.individualUsers
                    };
                }
                if (assignment.manualAssignment.groups) {
                    test.assignment.manualAssignment = {
                        ...test.assignment.manualAssignment,
                        groups: assignment.manualAssignment.groups
                    };
                }
            }
        }

        // Handle email invitations
        if (assignment.method === 'email' && assignment.invitationEmails) {
            test.assignment.method = 'email';
            test.assignment.invitationEmails = assignment.invitationEmails;

            const emailLink = generateSharableLink(test, 'restricted');
            assignment.invitationEmails.forEach(email => {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'You Have Been Assigned a New Test on QzPlatform',
                    html: `
                        <p>Dear User,</p>
                        <p>You have been assigned a new test on QzPlatform. Please log in to your account to access the test.</p>
                        <p>Test Name: ${test.testName}</p>
                        <p>Instructions: ${test.instruction}</p>
                        <p>To access the test, use the following link: <a href="${emailLink}">Access Test</a></p>
                        <p>If you have any questions, please contact our support team.</p>
                        <p>Best regards,<br> The QzPlatform Team</p>
                    `
                };
                sendMail(mailOptions);
            });
        }

        // Handle link sharing
        if (assignment.method === 'link') {
            test.assignment.method = 'link';
            test.assignment.linkSharing = assignment.linkSharing || 'restricted';

            const link = generateSharableLink(test, assignment.linkSharing);
            return res.status(200).json({ message: 'Test configured successfully', test, link });
        }
    }

    // Save the updated test
    try {
        await test.save();
        res.status(200).json({ message: 'Test administered successfully', test });
    } catch (error) {
        console.error("Error Administering Test:", error);
        res.status(500).json({ message: "Failed to administer test", error });
    }
});

// @Desc    Get administration settings for a test
// @route   GET /api/tests/:testId/administer
// @access  Public
const getAdministerSettings = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    // Find the test by ID
    const test = await Test.findById(testId);

    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Extracting administration-related details
    const administrationSettings = {
        scheduling: test.scheduling,
        timeAndAttempts: test.timeAndAttempts,
        configuration: test.configuration,
        proctoring: test.proctoring,
        assignment: test.assignment,
    };

    res.status(200).json({ message: 'Administration settings retrieved successfully', administrationSettings });
});


// @Desc    Update test configuration and administration settings
// @route   PATCH /api/tests/:testId/administer
// @access  private
const updateTestSettings = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const {
        scheduling,
        timeAndAttempts,
        configuration,
        proctoring
    } = req.body;

    // Find the test by ID
    const test = await Test.findById(testId);
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Update scheduling settings
    if (scheduling) {
        test.scheduling = {
            ...test.scheduling,
            ...scheduling,
            status: scheduling.endDate ? 'scheduled' : 'active'
        };
    }

    // Update time and attempts settings
    if (timeAndAttempts) {
        test.timeAndAttempts = {
            ...test.timeAndAttempts,
            ...timeAndAttempts
        };
    }

    // Update test configuration settings
    if (configuration) {
        test.configuration = {
            ...test.configuration,
            ...configuration
        };
    }

    // Update proctoring settings
    if (proctoring) {
        test.proctoring = {
            ...test.proctoring,
            ...proctoring
        };
    }

    // Save the updated test
    try {
        await test.save();
        res.status(200).json({ message: 'Test settings updated successfully', test });
    } catch (error) {
        console.error("Error Updating Test Settings:", error);
        res.status(500).json({ message: "Failed to update test settings", error });
    }
});


module.exports = { 
    administerTest, 
    getAdministerSettings,
    updateTestSettings 
};
