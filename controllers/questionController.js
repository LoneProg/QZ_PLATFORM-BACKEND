const asyncHandler = require('express-async-handler');
const Question = require('../models/questions');
const Test  = require('../models/tests');
const shuffleArray = require('../utils/shuffleArray');


// @Desc Add a question to test 
// @Route POST /api/tests/:testId/questions
// @Access Public
const addQuestionToTest = asyncHandler(async (req, res, next) => {
    const { testId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    // Validate questionType
    if (!['multipleChoice', 'TrueFalse', 'fillInTheGap'].includes(questionType)) {
        return res.status(400).json({ message: "Invalid question type. Must be 'multipleChoice', 'TrueFalse', or 'fillInTheGap'." });
    }

    // Validate questionText
    if (!questionText || typeof questionText !== 'string') {
        return res.status(400).json({ message: "Question text is required and must be a string." });
    }

    // Validation for multipleChoice questions
    if (questionType === 'multipleChoice') {
        if (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5) {
            return res.status(400).json({ message: "Multiple choice questions must have between 3 and 5 options." });
        }
        if (questionAnswers && questionAnswers.length > 0) {
            return res.status(400).json({ message: "Multiple choice questions should not have 'questionAnswers' field." });
        }
    }

    // Validation for TrueFalse questions
    if (questionType === 'TrueFalse') {
        if (!questionOptions || questionOptions.length !== 2) {
            return res.status(400).json({ message: "True or False questions must have exactly 2 options." });
        }

        const validTrueFalseOptions = [["True", "False"], ["False", "True"], ["Yes", "No"], ["No", "Yes"]];
        const providedOptions = questionOptions.map(option => option.optionText);
        if (!validTrueFalseOptions.some(validPair => JSON.stringify(validPair) === JSON.stringify(providedOptions))) {
            return res.status(400).json({ message: "True or False questions must have options: 'True' and 'False' or 'Yes' and 'No'." });
        }
    }

    // Validation for fillInTheGap questions
    if (questionType === 'fillInTheGap') {
        if (questionOptions && questionOptions.length > 0) {
            return res.status(400).json({ message: "Fill in the gap questions should not have any options." });
        }

        if (!questionAnswers || questionAnswers.length === 0) {
            return res.status(400).json({ message: "Fill in the gap questions must have answers." });
        }
    }

    try {
        // Create new question instance
        const newQuestion = new Question({
            questionType,
            questionText,
            questionOptions,
            points,
            category,
            randomizeAnswers
        });

        await newQuestion.save();

        // Associate question with the test
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        test.questions.push(newQuestion._id);
        await test.save();

        res.status(201).json(newQuestion);
    } catch (error) {
        next(error);
    }
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

// @Desc Update question in a Test 
// @Route PUT /api/tests/:testId/questions/:questionId
// @Access Public
const updateQuestionInTest = asyncHandler(async (req, res, next) => {
    const { testId, questionId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers } = req.body;

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Validation based on questionType
        if (questionType === 'multipleChoice') {
            if (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5) {
                return res.status(400).json({ message: 'Multiple choice questions must have between 3 and 5 options.' });
            }
        } else if (questionType === 'TrueFalse') {
            if (!questionOptions || questionOptions.length !== 2) {
                return res.status(400).json({ message: 'True or False questions must have exactly 2 options.' });
            }

            const validTrueFalseOptions = [["True", "False"], ["False", "True"], ["Yes", "No"], ["No", "Yes"]];
            const providedOptions = questionOptions.map(option => option.optionText);
            if (!validTrueFalseOptions.some(validPair => JSON.stringify(validPair) === JSON.stringify(providedOptions))) {
                return res.status(400).json({ message: 'True or False questions must have options: "True" and "False" or "Yes" and "No".' });
            }
        } else if (questionType === 'fillInTheGap') {
            if (questionOptions && questionOptions.length > 0) {
                return res.status(400).json({ message: 'Fill in the gap questions should not have any options.' });
            }

            if (!req.body.questionAnswers || req.body.questionAnswers.length === 0) {
                return res.status(400).json({ message: 'Fill in the gap questions must have answers.' });
            }
        }

        question.questionType = questionType || question.questionType;
        question.questionText = questionText || question.questionText;
        question.questionOptions = questionOptions || question.questionOptions;
        question.points = points || question.points;
        question.category = category || question.category;
        question.randomizeAnswers = randomizeAnswers || question.randomizeAnswers;

        await question.save();

        res.json(question);
    } catch (error) {
        next(error);
    }
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