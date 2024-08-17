const mongoose = require ("mongoose");
const Schema = mongoose.Schema;


const questionSchema = new Schema({
    type: { type: String, enum:["multiChoice, TrueFalse, shortAnswer"], required: true},
    text: { type: String, required: true},
    options: [String],
    correctAnswer: { type: Schema.Types.Mixed},
    settings: {
        points: { type: Number},
        category: { type: String},
        randomizeOptions: { type: Boolean, default: false},
    }
},{timestamps: true});

modules.export = mongoose.model("Question", questionSchema)