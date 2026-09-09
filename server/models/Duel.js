const mongoose = require('mongoose');

const DuelQuestionSchema = new mongoose.Schema({
    originalQuestionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Number, required: true },
    conceptTag: { type: String, default: null }
}, { _id: false });

const DuelSchema = new mongoose.Schema({
    challengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED'],
        default: 'PENDING'
    },
    questions: [DuelQuestionSchema],
    challengerScore: { type: Number, default: null }, // Null means not attempted
    opponentScore: { type: Number, default: null },
    challengerAnswers: [{ type: Number }],
    opponentAnswers: [{ type: Number }],
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Null can mean draw if status is COMPLETED
}, { timestamps: true });

module.exports = mongoose.model('Duel', DuelSchema);
