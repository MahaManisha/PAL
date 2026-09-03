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
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }, // Optional for chapter-level progress
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }, // Added for chapter progress
    score: { type: Number, default: 0 },
    bestScore: { type: Number },
    latestScore: { type: Number },
    learningCompleted: { type: Boolean, default: false },
    practiceCompleted: { type: Boolean, default: false },
    rewardClaimed: { type: Boolean, default: false },
    attempts: [AttemptSchema],
    status: { type: String, enum: ['in_progress', 'pass', 'fail'], required: true },
    // Adaptive Learning additions
    currentLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'PENDING'], default: 'PENDING' },
    pathType: { type: String, enum: ['DIRECT_MAIN_CONTENT', 'GUIDED', 'PENDING'], default: 'PENDING' },
    initialAssessmentScore: { type: Number },
    finalAssessmentScore: { type: Number },
    topicScores: [{
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
        score: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
