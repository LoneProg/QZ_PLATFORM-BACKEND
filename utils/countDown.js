const moment = require('moment');
const { notifyUsers } = require('../controllers/waitlistController');

// Set the product launch date (You can adjust this to any date you want)
const launchDate = moment("2024-10-15 00:00:00");

// Countdown check function
const checkCountdown = () => {
    const now = moment();
    const diff = launchDate.diff(now);

    if (diff <= 0) {
        console.log("Countdown finished! Sending notifications...");
        notifyUsers();  // Trigger notifications to users when countdown finishes
    } else {
        console.log(`Countdown: ${moment.utc(diff).format("DD:HH:mm:ss")}`);
    }
};

// Start checking the countdown every minute (adjust the interval if necessary)
const startCountdown = () => {
    setInterval(checkCountdown, 60000); // Run every 60 seconds
};

module.exports = { startCountdown };
