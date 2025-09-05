const express = require('express');
const router = express.Router();
const { 
  getAvailableTests, 
  startTest, 
  getTestQuestion, 
  saveTestProgress, 
  submitTest 
} = require('../controllers/testTakerController');  // Adjust path as necessary

// Middleware for authentication (assuming you have a middleware for this)
const { protect } = require('../middleware/authMiddleware');  // Adjust path as necessary

// Route to get all available tests for the logged-in user
router.get('/available-tests', protect, getAvailableTests);

// Route to start a test for a user
router.post('/:testId/start', protect, startTest);

// Route to get a specific question from a test by index for pagination
router.get('/:testId/questions/:questionIndex', protect, getTestQuestion);

// Route to save progress of the test
router.put('/:testId/progress', protect, saveTestProgress);

// Route to submit a completed test
router.post('/:testId/submit', protect, submitTest);

module.exports = router;
