const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    linkQuestionToTest,
    unlinkQuestionFromTest
} = require('../controllers/questionBankController');

// @Route POST /api/questions
router.post('/', createQuestion);

// @Route GET /api/questions
router.get('/', getAllQuestions);

// @Route GET /api/questions/:id
router.get('/:id', getQuestionById);

// @Route PUT /api/questions/:id
router.put('/:id', updateQuestion);

// @Route DELETE /api/questions/:id
router.delete('/:id', deleteQuestion);

// @Route GET /api/questions/search
router.get('/search', searchQuestions);

// @Route POST /api/questions/:questionId/link/:testId
router.post('/:questionId/link/:testId', linkQuestionToTest);

// @Route DELETE /api/questions/:questionId/unlink/:testId
router.delete('/:questionId/unlink/:testId', unlinkQuestionFromTest);

module.exports = router;
