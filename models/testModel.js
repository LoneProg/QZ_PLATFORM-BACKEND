const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  type: {
    type: String,
    required: [true, "Question type is required"],
    enum: ["multiple-choice", "true-false", "fill-in-the-blank"],
  },
  options: {
    type: [String],
    validate: {
      validator: function (options) {
        // Only validate if the question type is 'multiple-choice'
        return this.type === "multiple-choice" ? options.length === 4 : true;
      },
      message: "Options should be an array of 4 strings",
    },
  },
  correctAnswer: {
    type: String,
    required: [true, "Correct answer is required"],
    // Allow correctAnswer to be more flexible depending on the question type
    validate: {
      validator: function (answer) {
        if (this.type === "multiple-choice") {
          return ["a", "b", "c", "d"].includes(answer);
        } else if (this.type === "true-false") {
          return ["true", "false"].includes(answer.toLowerCase());
        } else if (this.type === "fill-in-the-blank") {
          return typeof answer === "string" && answer.trim().length > 0;
        }
        return false;
      },
      message: function () {
        return this.type === "multiple-choice"
          ? "Correct answer must be one of 'a', 'b', 'c', 'd'"
          : this.type === "true-false"
          ? "Correct answer must be 'true' or 'false'"
          : "Correct answer cannot be empty";
      },
    },
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
