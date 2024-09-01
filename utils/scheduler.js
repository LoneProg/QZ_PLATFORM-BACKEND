const cron = require('node-cron');
const Test = require('../models/tests');
const { sendMail } = require('./sendEmail');
const { generateSharableLink } = require('./generateSharebleLink');

// Function to execute scheduled assignments
const executeScheduledAssignments = async () => {
    const now = new Date();
    console.log('Executing scheduled assignments at:', now);

    try {
        // Find all tests with enabled scheduled assignments that are due
        const testsToAssign = await Test.find({
            'assignment.scheduledAssignment.enabled': true,
            'assignment.scheduledAssignment.scheduledTime': { $lte: now }
        });

        console.log(`Found ${testsToAssign.length} tests to assign`);

        testsToAssign.forEach(async (test) => {
            if (test.assignment.method === 'email') {
                // Send email invitations
                const emailLink = generateSharableLink(test, 'restricted');
                test.assignment.invitationEmails.forEach(email => {
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
                    
                    try {
                        await sendMail(mailOptions);
                        console.log(`Email sent to: ${email}`);
                    } catch (mailError) {
                        console.error(`Failed to send email to: ${email}`, mailError);
                    }
                });
            }

            // Mark as assigned
            test.assignment.scheduledAssignment.enabled = false;
            try {
                await test.save();
                console.log(`Test ${test._id} marked as assigned`);
            } catch (saveError) {
                console.error(`Failed to save test ${test._id}`, saveError);
            }
        });
    } catch (error) {
        console.error('Error executing scheduled assignments:', error);
    }
};

// Schedule the task to run every minute
cron.schedule('* * * * *', () => {
    executeScheduledAssignments();
});

module.exports = { executeScheduledAssignments };
