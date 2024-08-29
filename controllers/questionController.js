const asyncHandler = require('express-async-handler');
const Question = require('../models/questions');
const Test = require('../models/tests');
const shuffleArray = require('../utils/shuffleArray');
const validateQuestionInput = require('../utils/validateQuestions')


// @Desc List all questions in the Question Bank
// @Route GET /api/questions
// @Access Public
const listAllQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find().populate('linkedTests', 'testName');
    res.json(questions);
});

// @Desc Add a new question (to Question Bank or to a test)
// @Route POST /api/questions | /api/tests/:testId/questions
// @Access Public
const addQuestion = asyncHandler(async (req, res, next) => {
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;
    const { testId } = req.params;

    const error = validateQuestionInput(questionType, questionOptions, questionAnswers);
    if (error) return res.status(400).json({ message: error });

    if (!questionText || typeof questionText !== 'string') {
        return res.status(400).json({ message: "Question text is required and must be a string." });
    }

    try {
        const newQuestion = new Question({
            questionType,
            questionText,
            questionOptions,
            points,
            category,
            randomizeAnswers,
            questionAnswers
        });

        await newQuestion.save();

        if (testId) {
            const test = await Test.findById(testId);
            if (!test) return res.status(404).json({ message: 'Test not found' });

            test.questions.push(newQuestion._id);
            await test.save();

            newQuestion.linkedTests.push(testId);
            await newQuestion.save();
        }

        res.status(201).json(newQuestion);
    } catch (error) {
        next(error);
    }
});

// @Desc Get a specific question
// @Route GET /api/questions/:id | /api/tests/:testId/questions/:questionId
// @Access Public
const getQuestionById = asyncHandler(async (req, res) => {
    const { id, testId, questionId } = req.params;

    const question = await Question.findById(id || questionId).populate('linkedTests', 'testName');
    if (!question) return res.status(404).json({ message: 'Question not found' });

    res.json(question);
});

// @Desc Update a question
// @Route PUT /api/questions/:id | /api/tests/:testId/questions/:questionId
// @Access Public
const updateQuestion = asyncHandler(async (req, res, next) => {
    const { id, testId, questionId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    try {
        const question = await Question.findById(id || questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const error = validateQuestionInput(questionType, questionOptions, questionAnswers);
        if (error) return res.status(400).json({ message: error });

        question.questionType = questionType || question.questionType;
        question.questionText = questionText || question.questionText;
        question.questionOptions = questionOptions || question.questionOptions;
        question.points = points || question.points;
        question.category = category || question.category;
        question.randomizeAnswers = randomizeAnswers || question.randomizeAnswers;
        question.questionAnswers = questionAnswers || question.questionAnswers;

        await question.save();
        res.json(question);
    } catch (error) {
        next(error);
    }
});

// @Desc Delete a question
// @Route DELETE /api/questions/:id | /api/tests/:testId/questions/:questionId
// @Access Public
const deleteQuestion = asyncHandler(async (req, res) => {
    const { id, testId, questionId } = req.params;
    const question = await Question.findById(id || questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await question.remove();

    if (testId) {
        const test = await Test.findById(testId);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        test.questions = test.questions.filter(q => q.toString() !== (id || questionId));
        await test.save();

        question.linkedTests = question.linkedTests.filter(t => t.toString() !== testId);
        await question.save();
    }

    res.json({ message: 'Question deleted successfully' });
});

// @Desc Link or unlink a question from a test
// @Route PUT /api/questions/:id/link/:testId | /api/questions/:id/unlink/:testId
// @Access Public
const linkOrUnlinkQuestionToTest = asyncHandler(async (req, res) => {
    const { id, testId } = req.params;
    const { action } = req.query; // action=link or action=unlink

    const question = await Question.findById(id);
    const test = await Test.findById(testId);

    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (action === 'link') {
        if (test.questions.includes(id)) return res.status(400).json({ message: 'Question already linked to this test' });

        test.questions.push(id);
        await test.save();

        question.linkedTests.push(testId);
        await question.save();

        res.json({ message: 'Question linked to test successfully' });
    } else if (action === 'unlink') {
        if (!test.questions.includes(id)) return res.status(400).json({ message: 'Question is not linked to this test' });

        test.questions = test.questions.filter(q => q.toString() !== id);
        await test.save();

        question.linkedTests = question.linkedTests.filter(t => t.toString() !== testId);
        await question.save();

        res.json({ message: 'Question unlinked from test successfully' });
    } else {
        res.status(400).json({ message: 'Invalid action' });
    }
});

// @Desc Get all questions for a test with randomized options
// @Route GET /api/tests/:testId/questions
// @Access Public
const getTestQuestions = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate('questions');
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const randomizedQuestions = test.questions.map((question) => {
        if (question.randomizeAnswers) {
            const shuffledOptions = shuffleArray([...question.questionOptions]);
            return { ...question.toObject(), questionOptions: shuffledOptions };
        }
        return question;
    });

    res.json(randomizedQuestions);
});

// @Desc Search questions based on filters
// @Route GET /api/questions/search
// @Access Public
const searchQuestions = asyncHandler(async (req, res, next) => {
    const { category, points, questionType } = req.query;
    const query = {};
    if (category) query.category = category;
    if (points) query.points = points;
    if (questionType) query.questionType = questionType;

    try {
        const questions = await Question.find(query);
        res.status(200).json(questions);
    } catch (error) {
        next(error);
    }
});

module.exports = {
    listAllQuestions,
    addQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    linkOrUnlinkQuestionToTest,
    getTestQuestions,
    searchQuestions
};
