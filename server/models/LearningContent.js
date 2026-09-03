const mongoose = require('mongoose');

const LearningContentSchema = new mongoose.Schema({
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }, // Optional, only for MICRO_PPT
    type: { type: String, enum: ['TRAILER', 'MAIN_PPT', 'MICRO_PPT', 'MICRO_VIDEO'], required: true },
    title: { type: String, required: true },
    driveLink: { type: String }, // Store Google Drive embed link or path
    order: { type: Number, default: 0 }
});

module.exports = mongoose.model('LearningContent', LearningContentSchema);
