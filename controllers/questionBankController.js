const asyncHandler = require('express-async-handler');
const Question = require('../models/questions'); // Unified model
const Test = require('../models/tests'); // Model for tests


// @Desc List all questions in the Question Bank
// @Route GET /api/questions
// @Access Public
const listAllQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find().populate('linkedTests', 'testName');
    res.json(questions);
});

// @Desc Add a new question to the Question Bank
// @Route POST /api/questions
// @Access Public
const addNewQuestion = asyncHandler(async (req, res, next) => {
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
        res.status(201).json(newQuestion);
    } catch (error) {
        next(error);
    }
});

// @Desc Get a specific question from the Question Bank
// @Route GET /api/questions/:id
// @Access Public
const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const question = await Question.findById(id).populate('linkedTests', 'testName');
    if (!question) {
        res.status(404).json({ message: 'Question not found' });
    } else {
        res.json(question);
    }
});

// @Desc Update a question in the Question Bank
// @Route PUT /api/questions/:id
// @Access Public
const updateQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (questionType) {
            if (questionType === 'multipleChoice' && (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5)) {
                return res.status(400).json({ message: 'Multiple choice questions must have between 3 and 5 options.' });
            }
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

// @Desc Delete a question from the Question Bank
// @Route DELETE /api/questions/:id
// @Access Public
const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Remove the question from all linked tests
        await Test.updateMany(
            { questions: id },
            { $pull: { questions: id } }
        );

        await question.remove();
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question' });
    }
});


// @Desc Link a question from the Question Bank to a test
// @Route PUT /api/questions/:id/link/:testId
// @Access Public
const linkQuestionToTest = asyncHandler(async (req, res) => {
    const { id, testId } = req.params;

    try {
        const question = await Question.findById(id);
        const test = await Test.findById(testId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        if (test.questions.includes(id)) {
            return res.status(400).json({ message: 'Question already linked to this test' });
        }

        test.questions.push(id);
        await test.save();

        question.linkedTests.push(testId);
        await question.save();

        res.json({ message: 'Question linked to test successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error linking question to test' });
    }
});

// @Desc Unlink a question from a test
// @Route PUT /api/questions/:id/unlink/:testId
// @Access Public
const unlinkQuestionFromTest = asyncHandler(async (req, res) => {
    const { id, testId } = req.params;

    try {
        const question = await Question.findById(id);
        const test = await Test.findById(testId);

        if (!question) return res.status(404).json({ message: 'Question not found' });
        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (!test.questions.includes(id)) return res.status(400).json({ message: 'Question is not linked to this test' });

        test.questions = test.questions.filter(q => q.toString() !== id);
        await test.save();

        question.linkedTests = question.linkedTests.filter(t => t.toString() !== testId);
        await question.save();

        res.json({ message: 'Question unlinked from test successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error unlinking question from test' });
    }
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

    console.log('Query:', query); // Log the query for debugging

    try {
        const questions = await Question.find(query);
        res.status(200).json(questions);
    } catch (error) {
        next(error);
    }
});


module.exports = {
    listAllQuestions,
    addNewQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    linkQuestionToTest,
    unlinkQuestionFromTest,
    searchQuestions
};
