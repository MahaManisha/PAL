const mongoose = require('mongoose');

const SessionHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    topicName: { type: String, required: true },
    subjectName: { type: String },
    durationSeconds: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    mistakes: [{
        questionText: String,
        selectedOption: Number,
        correctOption: Number
    }],
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SessionHistory', SessionHistorySchema);
