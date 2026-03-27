const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    chapterName: { type: String, required: true },
    order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Chapter', ChapterSchema);
