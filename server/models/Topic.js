const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    topicName: { type: String, required: true },
    order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Topic', TopicSchema);
