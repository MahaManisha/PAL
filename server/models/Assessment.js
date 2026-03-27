const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    questions: [{
        questionText: String,
        options: [String],
        correctAnswer: Number // Index of the correct option
    }],
    passScore: { type: Number, default: 70 }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
