const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: function (options) {
        return options.length === 4;
      },
      message: "Options should be an array of 4 strings",
    },
  },
  correctAnswer: {
    type: String,
    required: [true, "Correct answer is required"],
    enum: ["a", "b", "c", "d"],
  },
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  passcode: { type: String, required: true },
  questions: [questionSchema],
  isGroupTest: { type: Boolean, default: false },
  categories: [String],
});

module.exports = mongoose.model("Test", testSchema);
