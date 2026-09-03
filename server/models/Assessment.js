const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }, // Optional if it's a chapter-level assessment
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    type: { type: String, enum: ['INITIAL', 'TOPIC', 'FINAL'], default: 'TOPIC' },
    questions: [{
        questionText: String,
        options: [String],
        correctAnswer: Number, // Index of the correct option
        conceptTag: { type: String, default: null },
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' } // Added to map questions to topics for initial/final assessments
    }],
    passScore: { type: Number, default: 70 }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
