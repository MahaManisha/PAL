const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['pass', 'fail'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
