const asyncHandler = require('express-async-handler');
const Question = require('../models/questions');
const Test  = require('../models/tests');
const shuffleArray = require('../utils/shuffleArray');
const QuestionBank = require('../models/questionBank');

//@Desc Add a question to test 
//@Route POST /api/tests/:testId/questions
//@Access Public
const addQuestionToTest = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { questionType, questionText, questionOptions, questionAnswers, points, category, randomizeAnswers } = req.body;

    const newQuestion = new Question({
        questionType,
        questionText,
        questionOptions,
        questionAnswers,
        points,
        category,
        randomizeAnswers
    });

    await newQuestion.save();

    // Associate question with the test
    const test = await Test.findById(testId);
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }
    test.questions.push(newQuestion._id);
    await test.save();

    res.status(201).json(newQuestion);
});


//@Desc Get all questions for a test with randomized options 
//@Route GET /api/tests/:testId/questions
//@Access Public

const getTestQuestions = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const randomizedQuestions = test.questions.map((question) => {
        if (question.randomizeAnswers) {
            // Make a copy of question options and shuffle them
            const shuffledOptions = shuffleArray([...question.questionOptions]);
            return {
                ...question.toObject(),
                questionOptions: shuffledOptions
            };
        }
        return question;
    });

    res.json(randomizedQuestions);
});

//@Desc Get a specific question from a test by question ID
//@Route GET /api/tests/:testId/questions/:questionId
//@Access Public
const getQuestionFromTestById = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;

    // Find the test by ID
    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    // Find the specific question within the test's questions array
    const question = test.questions.find(q => q._id.toString() === questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    res.status(200).json(question);
});

//@Desc Update questions in a Test 
//@Route PUT /api/tests/:testId/:questionId
//Access Public
const updateQuestionInTest = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;
    const { questionType, questionText, questionOptions, questionAnswers, points, category, randomizeAnswers } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    question.questionType = questionType || question.questionType;
    question.questionText = questionText || question.questionText;
    question.questionOptions = questionOptions || question.questionOptions;
    question.questionAnswers = questionAnswers || question.questionAnswers;
    question.points = points || question.points;
    question.category = category || question.category;
    question.randomizeAnswers = randomizeAnswers || question.randomizeAnswers;

    await question.save();

    res.json(question);
});

//@Desc Delete question from test
//@Route GET /api/tests/:testId/:questionId
//@Access Public
const deleteQuestionFromTest = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    await question.remove();

    // Remove question reference from the test
    const test = await Test.findById(testId);
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    test.questions = test.questions.filter(q => q.toString() !== questionId);
    await test.save();

    res.json({ message: 'Question deleted successfully' });
});

module.exports = {
    addQuestionToTest,
    getTestQuestions,
    getQuestionFromTestById,
    updateQuestionInTest,
    deleteQuestionFromTest 
}