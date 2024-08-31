const jwt = require('jsonwebtoken');

// Function to generate a sharable link
const generateSharableLink = (test, type) => {
    const payload = {
        testId: test._id,
        testName: test.testName,
        scheduling: test.scheduling,
        timeAndAttempts: test.timeAndAttempts,
        configuration: test.configuration,
        proctoring: test.proctoring,
        assignment: test.assignment
        accessCode: test.configuration.accessCode
    };

    // Create a token with all test settings and configurations
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Construct the URL with the token as a query parameter
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/take-test?token=${token}&type=${type}`;
};

module.exports = { generateSharableLink };
