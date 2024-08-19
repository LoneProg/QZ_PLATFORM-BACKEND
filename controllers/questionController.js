const asyncHandler = require('express-async-handler');
const Question = require('../models/questions');
const Test  = require('../models/tests');
const QuestionBank = require('../models/questionBank');

//@Desc Add questions to a test
//@Route POST /api/tests/:testId/questions
//@Access Public
const addQuestionsToTest = asyncHandler(async (req, res) => {
    try {
        const { questions } = req.body; // Array of question IDs
        const test = await Test.findById(req.params.testId);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Validate that the provided questions exist
        const validQuestions = await Question.find({ _id: { $in: questions } });
        if (validQuestions.length !== questions.length) {
            return res.status(400).json({ message: 'One or more questions are invalid' });
        }

        test.questions.push(...questions);
        const updatedTest = await test.save();
        res.status(200).json({ message: "Questions added successfully", updatedTest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});