const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TestSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instruction: { type: String },
    settings: {
        startDate: { type: Date },
        endDate: { type: Date },
        timeLimit: { type: Number },
        attempts: { type: Number },
        availability: { type: String, enum: ['Open', 'Restricted'], default:'Restricted' },
        randomize: { type: Boolean },
        passingScore: { type: Number},
        accessCode: { type: String }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
    });
    
module.exports = mongoose.model('Test', TestSchema);