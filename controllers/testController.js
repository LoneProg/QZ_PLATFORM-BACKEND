const Test = require("../models/testModel");
const generatePasscode = require("../utils/generatePasscode");

const createTest = async (req, res) => {
  const { title, questions, isGroupTest, categories } = req.body;

  try {
    // Optional: Validate questions before creating the test
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Check if the question type is valid and its fields are correctly populated
      if (
        !["multiple-choice", "true-false", "fill-in-the-blank"].includes(
          question.type
        )
      ) {
        return res
          .status(400)
          .json({ message: `Invalid question type at index ${i}` });
      }

      if (
        question.type === "multiple-choice" &&
        question.options.length !== 4
      ) {
        return res
          .status(400)
          .json({
            message: `Question at index ${i} must have exactly 4 options`,
          });
      }

      if (
        question.type === "true-false" &&
        !["true", "false"].includes(question.correctAnswer.toLowerCase())
      ) {
        return res
          .status(400)
          .json({
            message: `Question at index ${i} must have a correct answer of 'true' or 'false'`,
          });
      }

      if (
        question.type === "fill-in-the-blank" &&
        !question.correctAnswer.trim()
      ) {
        return res
          .status(400)
          .json({
            message: `Fill-in-the-blank question at index ${i} must have a non-empty correct answer`,
          });
      }
    }

    // Create a new test document
    const newTest = new Test({
      title,
      creator: req.user, // Assuming `req.user.id` comes from the authenticated user
      passcode: generatePasscode(),
      questions,
      isGroupTest,
      categories,
    });

    await newTest.save(); // Save the test to the database
    res
      .status(201)
      .json({ message: "Test created successfully", test: newTest });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTestByPasscode = async (req, res) => {
  const { passcode } = req.params;

  try {
    const test = await Test.findOne({ passcode });
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createTest, getTestByPasscode };
