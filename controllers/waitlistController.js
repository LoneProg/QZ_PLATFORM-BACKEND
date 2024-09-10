const asyncHandler = require('express-async-handler');
const Waitlist = require('../models/waitlists');
const { sendMail } = require('../utils/sendEmail');

//@Desc Add email to waitlist
//@Route POST /api/waitlist
//@Access Public
const addToWaitlist = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await Waitlist.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already subscribed to the waitlist." });
        }

        const newEntry = new Waitlist({ email });
        await newEntry.save();

        
        // You can send a confirmation email here if required
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Subscription Confirmation',
            html: `
            <p>Dear Esteemed Value Customer, </p>
            <p> You have been successfully added to the qzplatform waitlist!</p>

            <p>Get ready to explore a seamless enhanced assessment with  fusion of creativity and technology in simplifying the assessment processes </p>

            </p>Watchout as the countdown begins.....!</p>
            <p>Best regards,<br>
            <strong>The QzPlatform Team</strong></p>`
        };

        await sendMail(mailOptions);

        res.status(200).json({ message: "Email added to the waitlist." });
    } catch (error) {
        console.error("Error adding email to waitlist:", error);
        res.status(500).json({ message: "Server error." });
    }
};

//@Desc get all users on the waitlist
//@Route GET /api/waitlist
//@Access Public
const getWaitlist = asyncHandler(async (req, res) => {
    const users = await Waitlist.find({});
    res.json(users);
});

// Function to send notifications when the product is released
//@Desc Notify users on the waitlist
//@Route GET /api/waitlist/notify
//@Access Public
const notifyUsers = async () => {
    try {
        const users = await Waitlist.find({});
        const mailOptions = {
            from: process.env.EMAIL,
            subject: 'Product Launch Notification',
            html: `
            <p>Hurray!</p>,
            <p>Your wait is over as the qzplatform goes live!</p>
            <p> We are pleased to welcome you on board as you begin to explore   our simplified assessment platform, the first of its kind and  solutions  to all your assessments needs </p>
            <p> A seamless assessment process awaits you.</p>
            <p> Let's start! <a href="https://qzplatform.com">Click here to get started</a></p>

            <p>Best regards,<br>
            <strong>The QzPlatform Team</strong></p>`
        };

        users.forEach(async (user) => {
            try {
                // Send email to each user
                await sendMail({ ...mailOptions, to: user.email });
                console.log(`Notification sent to ${user.email}`);
            } catch (error) {
                console.error(`Error sending notification to ${user.email}:`, error);
            }
        });
    } catch (error) {
        console.error("Error notifying users:", error);
    }
};

module.exports = { addToWaitlist, getWaitlist, notifyUsers };
