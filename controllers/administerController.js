const asyncHandler = require("express-async-handler");
const Test = require('../models/Test');
const { sendMail } = require('../utils/sendEmail');
const { generateSharableLink } = require('../utils/generateLink'); // Assuming a utility function for link generation

// @Desc    Configure and administer a test
// @route   POST /api/tests/:testId/administer
// @access  private
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
                        <p>To access the test, use the following link: <a href="${generateSharableLink(test._id, 'restricted')}">Access Test</a></p>
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

            const link = generateSharableLink(test._id, assignment.linkSharing);
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

module.exports = { administerTest };
