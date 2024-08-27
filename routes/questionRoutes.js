const express = require('express');
const router = express.Router({ mergeParams: true });  // mergeParams to access parent route params
const {
    addQuestionToTest,
    getTestQuestions,
    getQuestionFromTestById,
    updateQuestionInTest,
    deleteQuestionFromTest,
} = require('../controllers/questionController');

// Add question to test
router.post('/', addQuestionToTest);  // Use base path '/' since parent route provides /:testId/questions

// Get questions for test
router.get('/', getTestQuestions);  // Adjust to use base path

// Get question from test by Id
router.get('/:questionId', getQuestionFromTestById);

// Update questions in Test
router.put('/:questionId', updateQuestionInTest);

// Delete questions From Test
router.delete('/:questionId', deleteQuestionFromTest);

module.exports = router;
