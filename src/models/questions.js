const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    questionType: {
      type: String,
      enum: ["multipleChoice", "TrueFalse", "fillInTheGap"],
      required: true,
    },
    questionText: { type: String, required: true },
    questionOptions: [
      {
        optionText: { type: String },
        isCorrect: { type: Boolean },
      },
    ],
    questionAnswers: [{ type: String }], // For fillInTheGap or any other type where answers are provided
    points: { type: Number },
    category: { type: String },
    randomizeAnswers: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Assuming you have a User model
    linkedTests: [{ type: Schema.Types.ObjectId, ref: "Test" }], // To keep track of tests that use this question
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

module.exports = mongoose.model("Question", QuestionSchema);
