const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Question Bank Routes
router.get('/', questionController.listAllQuestions);
router.post('', questionController.addQuestion);
router.get('/search', questionController.searchQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);
router.put('/:id/link/:testId', questionController.linkOrUnlinkQuestionToTest);
router.put('/:id/unlink/:testId', questionController.linkOrUnlinkQuestionToTest);

// Test-Specific Question Routes
router.post('/:testId/questions', questionController.addQuestion);
router.get('/:testId/questions', questionController.getTestQuestions);
router.get('/:testId/questions/:questionId', questionController.getQuestionById);
router.put('/:testId/questions/:questionId', questionController.updateQuestion);
router.delete('/:testId/questions/:questionId', questionController.deleteQuestion);

module.exports = router;
