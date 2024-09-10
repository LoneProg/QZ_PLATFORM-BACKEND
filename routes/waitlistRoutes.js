const express = require('express');
const { addToWaitlist, getWaitlist } = require('../controllers/waitlistController');

const router = express.Router();

// Endpoint to add users to waitlist
router.post('/api/waitlist', addToWaitlist);

//endpoint for getting all users on the waitlist
router.get('/api/waitlist', getWaitlist);

module.exports = router;
