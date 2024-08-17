const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TestSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    createdBy: { type: String, required: true },
    instruction: { type: String },
    questions: [{type: Schema.Types.ObjectId, ref: 'Question'}],
    settings: {
        startDate: { type: Date },
        endDate: { type: Date },
        timeLimit: { type: Number },
        attempts: { type: Number, default: 1 },
        availability: { type: Boolean, default: false },
        randomizeQuestions: { type: Boolean, default: false },
        passingScore: { type: Number, default: 0},
        accessCode: { type: String }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
    });
    
module.exports = mongoose.model('Test', TestSchema);