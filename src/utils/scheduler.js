const cron = require("node-cron");
const Test = require("../models/tests");
const { sendMail } = require("./sendEmail");
const { generateSharableLink } = require("./generateSharebleLink");
const moment = require("moment-timezone");

// Function to execute scheduled assignments
const executeScheduledAssignments = async () => {
  const nowUtc = moment().utc(); // Get current time in UTC
  const now = moment().tz("Africa/Lagos"); // Convert to Lagos time (WAT)
  console.log("Executing scheduled assignments at (UTC):", nowUtc.format());
  console.log("Executing scheduled assignments at (Local):", now.format());

  // Find all tests with enabled scheduled assignments that are due
  const testsToAssign = await Test.find({
    "assignment.scheduledAssignment.enabled": true,
    "assignment.scheduledAssignment.scheduledTime": { $lte: nowUtc.toDate() },
  });

  console.log("Tests to assign:", testsToAssign);

  for (const test of testsToAssign) {
    if (test.assignment.method === "email") {
      // Send email invitations
      const emailLink = generateSharableLink(test, "restricted");
      for (const email of test.assignment.invitationEmails) {
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "You Have Been Assigned a New Test on QzPlatform",
          html: `
                        <p>Dear User,</p>
                        <p>You have been assigned a new test on QzPlatform. Please log in to your account to access the test.</p>
                        <p>Test Name: ${test.testName}</p>
                        <p>Instructions: ${test.instruction}</p>
                        <p>To access the test, use the following link: <a href="${emailLink}">Access Test</a></p>
                        <p>If you have any questions, please contact our support team.</p>
                        <p>Best regards,<br> The QzPlatform Team</p>
                    `,
        };
        console.log("Sending mail to:", email);
        await sendMail(mailOptions);
        console.log("Mail sent to:", email);
      }
    }

    // Mark as assigned
    test.assignment.scheduledAssignment.enabled = false;
    await test.save();
  }
};

// Schedule the task to run every minute
cron.schedule("* * * * *", () => {
  executeScheduledAssignments();
});

module.exports = { executeScheduledAssignments };
