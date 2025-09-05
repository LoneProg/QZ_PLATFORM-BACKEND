const submitTestAutomatically = async (testResult, res) => {
  // Calculate score and mark test as completed
  const correctAnswersCount = testResult.answers.filter(
    (answer) => answer.isCorrect,
  ).length;
  testResult.score = (correctAnswersCount / testResult.answers.length) * 100;
  testResult.status = "completed";
  testResult.endTime = new Date();

  await testResult.save();

  // Optionally, you could destroy the user session or clear tokens here if needed

  res.status(200).json({
    message: "Test time expired. Test submitted automatically.",
    score: testResult.score,
  });
};
