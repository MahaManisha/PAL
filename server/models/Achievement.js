const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    category: { type: String, enum: ['mastery', 'streak', 'performance'], required: true },
    threshold: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
