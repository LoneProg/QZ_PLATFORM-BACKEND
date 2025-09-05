const asyncHandler = require("express-async-handler");
const Test = require("../models/tests");
const Question = require("../models/questions");
const TestResult = require("../models/testResults");
const mongoose = require("mongoose");
const { submitTestAutomatically } = require("./utils/autoSubmitTest");

// Get available tests for a user
const getAvailableTests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const availableTests = await Test.find({
    $or: [
      { "assignment.manualAssignment.individualUsers": userId },
      { "assignment.linkSharing": "public" },
    ],
    "scheduling.startDate": { $lte: new Date() },
    "scheduling.endDate": { $gte: new Date() },
  });

  res.status(200).json({ availableTests });
});

// Start a test
const startTest = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { testId } = req.params;

  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ message: "Test not found" });

  let testResult = await TestResult.findOne({ userId, testId });

  if (!testResult) {
    testResult = await TestResult.create({
      userId,
      testId,
      status: "in-progress",
      progress: {
        currentQuestionIndex: 0,
        remainingTime: test.timeLimit * 60, // Convert minutes to seconds
      },
    });
  }

  res.status(200).json({
    message: "Test started successfully",
    testResult,
  });
});

// Get a specific question for a test in pagination
const getTestQuestion = asyncHandler(async (req, res) => {
  const { testId, questionIndex } = req.params;
  const userId = req.user._id;

  const testResult = await TestResult.findOne({ userId, testId });
  if (!testResult)
    return res
      .status(404)
      .json({ message: "Test not started or does not exist" });

  if (testResult.status !== "in-progress")
    return res
      .status(400)
      .json({ message: "Test already submitted or not in progress" });

  const test = await Test.findById(testId).populate("questions");
  if (!test) return res.status(404).json({ message: "Test not found" });

  const question = test.questions[questionIndex];
  if (!question) return res.status(404).json({ message: "Question not found" });

  res.status(200).json({ question });
});

// Save progress of a test
const saveTestProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { testId } = req.params;
  const { progress } = req.body;

  let testResult = await TestResult.findOne({ userId, testId });
  if (!testResult)
    return res
      .status(404)
      .json({ message: "Test not started or does not exist" });

  if (testResult.status !== "in-progress")
    return res
      .status(400)
      .json({ message: "Test already submitted or not in progress" });

  // Check if time has expired
  const elapsedTime = (Date.now() - testResult.startTime.getTime()) / 1000; // in seconds
  if (elapsedTime >= testResult.progress.remainingTime) {
    // Time has expired, submit test
    return submitTestAutomatically(testResult, res);
  }

  // Otherwise, save progress
  testResult.progress = progress;
  await testResult.save();

  res.status(200).json({ message: "Progress saved successfully" });
});

// Submit a completed test
const submitTest = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { testId } = req.params;
  const { answers } = req.body;

  let testResult = await TestResult.findOne({ userId, testId });
  if (!testResult)
    return res
      .status(404)
      .json({ message: "Test not started or does not exist" });

  if (testResult.status !== "in-progress")
    return res
      .status(400)
      .json({ message: "Test already submitted or not in progress" });

  // Assuming answers array contains questionId and user's answer
  // Calculate the score and mark test as completed
  testResult.answers = answers.map((answer) => ({
    questionId: mongoose.Types.ObjectId(answer.questionId),
    answer: answer.answer,
    isCorrect: answer.isCorrect, // Determine correctness based on question type and correct answer
  }));

  // Calculate score
  const correctAnswersCount = testResult.answers.filter(
    (answer) => answer.isCorrect,
  ).length;
  testResult.score = (correctAnswersCount / testResult.answers.length) * 100;
  testResult.status = "completed";
  testResult.endTime = new Date();

  await testResult.save();

  res
    .status(200)
    .json({ message: "Test submitted successfully", score: testResult.score });
});

module.exports = {
  getAvailableTests,
  startTest,
  getTestQuestion,
  saveTestProgress,
  submitTest,
};
