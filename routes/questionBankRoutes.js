const express = require('express');
const router = express.Router();
const {
    addNewQuestion,
    listAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    linkQuestionToTest,
    unlinkQuestionFromTest
} = require('../controllers/questionBankController');

// @Route POST /api/questions
router.post('/', addNewQuestion);

// @Route GET /api/questions
router.get('/', listAllQuestions);

// @Route GET /api/questions/:id
router.get('/:id', getQuestionById);

// @Route PUT /api/questions/:id
router.put('/:id', updateQuestion);

// @Route DELETE /api/questions/:id
router.delete('/:id', deleteQuestion);

// @Route GET /api/questions/search
router.get('/search', searchQuestions);

// @Route POST /api/questions/:questionId/link/:testId
router.put('/:id/link/:testId', linkQuestionToTest);

// @Route PUT /api/questions/:questionId/unlink/:testId
router.put('/:id/unlink/:testId', unlinkQuestionFromTest);

module.exports = router;
