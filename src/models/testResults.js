// In your TestResult schema (models/testResults.js)
const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
  startTime: { type: Date, default: Date.now }, // Record start time
  endTime: { type: Date }, // Optional: Record end time for history
  progress: {
    currentQuestionIndex: { type: Number, default: 0 },
    remainingTime: { type: Number }, // Time left in seconds
  },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      answer: String,
      isCorrect: Boolean,
    },
  ],
  score: Number,
});

const TestResult = mongoose.model("TestResult", testResultSchema);
module.exports = TestResult;
