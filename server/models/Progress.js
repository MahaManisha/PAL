const mongoose = require('mongoose');

const MistakeSchema = new mongoose.Schema({
    questionId: { type: String }, // Storing question id safely as string
    selectedOption: Number,
    correctOption: Number,
    conceptTag: { type: String, default: null } // Omitted/null for now as per project limitation
}, { _id: false });

const AttemptSchema = new mongoose.Schema({
    score: Number,
    timestamp: { type: Date, default: Date.now },
    mistakes: [MistakeSchema]
}, { _id: false });

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    score: { type: Number, default: 0 },
    bestScore: { type: Number },
    latestScore: { type: Number },
    learningCompleted: { type: Boolean, default: false },
    practiceCompleted: { type: Boolean, default: false },
    rewardClaimed: { type: Boolean, default: false },
    attempts: [AttemptSchema],
    status: { type: String, enum: ['in_progress', 'pass', 'fail'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
