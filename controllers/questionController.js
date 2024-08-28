const asyncHandler = require('express-async-handler');
const Question = require('../models/question'); // Adjusted import
const Test = require('../models/test'); // Adjusted import
const shuffleArray = require('../utils/shuffleArray');

// @Desc Add a question to a test 
// @Route POST /api/tests/:testId/questions
// @Access Public
const addQuestionToTest = asyncHandler(async (req, res, next) => {
    const { testId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    if (!['multipleChoice', 'TrueFalse', 'fillInTheGap'].includes(questionType)) {
        return res.status(400).json({ message: "Invalid question type." });
    }

    if (!questionText || typeof questionText !== 'string') {
        return res.status(400).json({ message: "Question text is required and must be a string." });
    }

    if (questionType === 'multipleChoice' && (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5)) {
        return res.status(400).json({ message: "Multiple choice questions must have between 3 and 5 options." });
    }

    if (questionType === 'TrueFalse' && (!questionOptions || questionOptions.length !== 2)) {
        return res.status(400).json({ message: "True or False questions must have exactly 2 options." });
    }

    if (questionType === 'fillInTheGap' && (!questionAnswers || questionAnswers.length === 0)) {
        return res.status(400).json({ message: "Fill in the gap questions must have answers." });
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

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        test.questions.push(newQuestion._id);
        await test.save();

        // Update the question's linkedTests
        newQuestion.linkedTests.push(testId);
        await newQuestion.save();

        res.status(201).json(newQuestion);
    } catch (error) {
        next(error);
    }
});

// @Desc Get all questions for a test with randomized options 
// @Route GET /api/tests/:testId/questions
// @Access Public
const getTestQuestions = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const randomizedQuestions = test.questions.map((question) => {
        if (question.randomizeAnswers) {
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

// @Desc Get a specific question from a test by question ID
// @Route GET /api/tests/:testId/questions/:questionId
// @Access Public
const getQuestionFromTestById = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const question = test.questions.find(q => q._id.toString() === questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    res.status(200).json(question);
});

// @Desc Update question in a Test 
// @Route PUT /api/tests/:testId/questions/:questionId
// @Access Public
const updateQuestionInTest = asyncHandler(async (req, res, next) => {
    const { testId, questionId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Validate and update question
        if (questionType) {
            if (questionType === 'multipleChoice' && (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5)) {
                return res.status(400).json({ message: 'Multiple choice questions must have between 3 and 5 options.' });
            }
            // Additional validation as needed
        }

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

// @Desc Delete question from a test
// @Route DELETE /api/tests/:testId/questions/:questionId
// @Access Public
const deleteQuestionFromTest = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    await question.remove();

    const test = await Test.findById(testId);
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    test.questions = test.questions.filter(q => q.toString() !== questionId);
    await test.save();

    // Remove the question's reference from linkedTests
    question.linkedTests = question.linkedTests.filter(id => id.toString() !== testId);
    await question.save();

    res.json({ message: 'Question deleted successfully' });
});

module.exports = {
    addQuestionToTest,
    getTestQuestions,
    getQuestionFromTestById,
    updateQuestionInTest,
    deleteQuestionFromTest
};
