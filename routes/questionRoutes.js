const express = require('express');
const router = express.Router();
const {
    addQuestionToTest,
    getTestQuestions,
    updateQuestionInTest,
    deleteQuestionFromTest,
} = require ('../controllers/questionController');

//Add question to test
router.post('/:testId/questions', addQuestionToTest);

//Get questions for test
router.get('/:testId/questions', getTestQuestions);

//Get question from test by Id
router.get('/:testId/:questionId', getQuestionFromTestById);

//Update questions in Test
router.put('/:testId/:questionId', updateQuestionInTest);

//delete questions From Test
router.delete('/:testId/:questionId', deleteQuestionFromTest);

module.exports = router;