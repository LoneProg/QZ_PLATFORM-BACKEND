const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionType: { 
        type: String, 
        enum: ['multipleChoice', 'TrueFalse', 'shortAnswer'], 
        required: true 
    },
    questionText: { type: String, required: true },
    questionOptions: [
        {
            optionText: { type: String },
            isCorrect: { type: Boolean }
        }
    ],
    questionAnswers: [String],
    points: { type: Number, default: 1, required: true },
    category: { type: String },
    randomizeAnswers: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);
