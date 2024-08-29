const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Question Bank Routes
router.get('/questions', questionController.listAllQuestions);
router.post('/questions', questionController.addQuestion);
router.get('/questions/search', questionController.searchQuestions);
router.get('/questions/:id', questionController.getQuestionById);
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);
router.put('/questions/:id/link/:testId', questionController.linkOrUnlinkQuestionToTest);
router.put('/questions/:id/unlink/:testId', questionController.linkOrUnlinkQuestionToTest);

// Test-Specific Question Routes
router.post('/tests/:testId/questions', questionController.addQuestion);
router.get('/tests/:testId/questions', questionController.getTestQuestions);
router.get('/tests/:testId/questions/:questionId', questionController.getQuestionById);
router.put('/tests/:testId/questions/:questionId', questionController.updateQuestion);
router.delete('/tests/:testId/questions/:questionId', questionController.deleteQuestion);

module.exports = router;
