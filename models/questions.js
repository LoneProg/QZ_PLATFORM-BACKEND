const mongoose = require ("mongoose");
const Schema = mongoose.Schema;


const questionSchema = new Schema({
    questionType: { type: String, enum:["multiChoice, TrueFalse, shortAnswer"], required: true},
    questionText: { type: String, required: true},
    questionOptions: [
        {
            optionText: { type : String },
            isCorrect: {type : Boolean}
        }
    ],
    correctAnswers: [Strings],
    settings: {
        points: { type: Number, default: 1},
        category: { type: String},
        randomizeOptions: { type: Boolean, default: false},
    }
},{timestamps: true});

modules.export = mongoose.model("Question", questionSchema)