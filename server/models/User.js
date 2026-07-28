const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String },
    // Legacy values 'gameified' and 'movie' are kept in the enum for backward
    // compatibility. Canonical values are 'gamified' and 'cinematic'.
    // Normalization happens on the frontend via themeNormalize.js.
    interest: {
        type: String,
        enum: ['professional', 'gameified', 'gamified', 'movie', 'cinematic', 'none'],
        default: 'none'
    },
    // Sub-theme within the chosen experience (e.g. 'corporate', 'rpg', 'sci-fi').
    // Empty string means the user has not yet selected a sub-theme.
    subTheme: { type: String, default: '' },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
    lastStudyDate: { type: String, default: '' },
    completedDailyQuestDate: { type: String, default: '' },
    unlockedBadges: [{
        achievementKey: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now }
    }],
    inventory: [{
        itemKey: { type: String, required: true },
        purchasedAt: { type: Date, default: Date.now }
    }],
    equipped: {
        avatar: { type: String, default: '' },
        profile_frame: { type: String, default: '' },
        theme_accent: { type: String, default: '' }
    },
    // Optional Profile Datas
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    targetGoal: { type: String, default: '' },
    institution: { type: String, default: '' },
    preferredStudyHours: { type: String, default: '' },
    socialLink: { type: String, default: '' }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.password || !this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function(password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
