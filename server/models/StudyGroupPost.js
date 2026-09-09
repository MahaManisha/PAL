const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const StudyGroupPostSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyGroup',
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    replies: [ReplySchema]
}, { timestamps: true });

module.exports = mongoose.model('StudyGroupPost', StudyGroupPostSchema);
