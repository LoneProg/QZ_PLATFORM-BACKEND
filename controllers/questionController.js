const asyncHandler = require('express-async-handler');
const Question = require('../models/questions');
const Test  = require('../models/tests');
const QuestionBank = require('../models/questionBank');

//@Desc Add a question
//@Route POST /api/questions
//@Access Public

//@Desc Get questions to a test
//@Route GET /api/questions
//@Access Public


//@Desc get questions by ID
//@Route GET /api/questions/:questionId
//@Access Public

//@Desc Update questions
//@Route PUT /api/questions
//@Access Public

//@Desc Add questions to a test
//@Route POST /api/tests/:testId/questions
//@Access Public
const addQuestionsToTest = asyncHandler(async (req, res) => {
    try {
        const { questions } = req.body; // Array of question IDs

        // Check if questions array is provided and not empty
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Questions array is required' });
        }

        const test = await Test.findById(req.params.testId);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Validate that the provided questions exist
        const validQuestions = await Question.find({ _id: { $in: questions } });
        if (validQuestions.length !== questions.length) {
            return res.status(400).json({ message: 'One or more questions are invalid' });
        }

        // Avoid adding duplicate question IDs
        const existingQuestionIds = new Set(test.questions.map(q => q.toString()));
        questions.forEach(q => {
            if (!existingQuestionIds.has(q)) {
                test.questions.push(q);
            }
        });

        const updatedTest = await test.save();
        res.status(200).json({ message: "Questions added successfully", updatedTest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
