const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['in-progress', 'completed', 'not-started'], default: 'not-started' },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: String,
    isCorrect: Boolean
  }],
  score: Number,
  progress: {
    currentQuestionIndex: { type: Number, default: 0 },
    remainingTime: Number // in seconds
  }
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);