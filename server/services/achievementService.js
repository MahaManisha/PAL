const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Progress = require('../models/Progress');
const notificationService = require('./notificationService');

// Canonical 5 achievements
const CANONICAL_ACHIEVEMENTS = [
    {
        key: 'FIRST_TOPIC',
        name: 'First Steps',
        description: 'Complete your first topic assessment with a passing score',
        icon: '🌱',
        category: 'mastery',
        threshold: 1
    },
    {
        key: 'TOPIC_MASTER_5',
        name: 'Topic Explorer',
        description: 'Pass 5 topic assessments across your subjects',
        icon: '🗺️',
        category: 'mastery',
        threshold: 5
    },
    {
        key: 'STREAK_3',
        name: 'Consistent Scholar',
        description: 'Reach a 3-day study streak',
        icon: '🔥',
        category: 'streak',
        threshold: 3
    },
    {
        key: 'STREAK_7',
        name: 'Dedicated Learner',
        description: 'Reach a 7-day study streak',
        icon: '⚡',
        category: 'streak',
        threshold: 7
    },
    {
        key: 'PERFECT_SCORE',
        name: 'Flawless Performance',
        description: 'Score 100% on any topic assessment',
        icon: '🎯',
        category: 'performance',
        threshold: 100
    }
];

/**
 * Non-destructive catalog initialization.
 * Upserts canonical catalog items without deleting existing records.
 */
const ensureCatalogInitialized = async () => {
    try {
        for (const item of CANONICAL_ACHIEVEMENTS) {
            await Achievement.updateOne(
                { key: item.key },
                { $setOnInsert: item },
                { upsert: true }
            );
        }
    } catch (err) {
        console.error('achievementService.ensureCatalogInitialized error:', err);
    }
};

/**
 * Atomic, concurrency-safe unlock helper.
 * Uses conditional update to guarantee uniqueness by achievementKey.
 */
const unlockBadge = async (userId, achievementKey) => {
    try {
        const result = await User.updateOne(
            {
                _id: userId,
                'unlockedBadges.achievementKey': { $ne: achievementKey }
            },
            {
                $push: {
                    unlockedBadges: {
                        achievementKey,
                        unlockedAt: new Date()
                    }
                },
                $inc: {
                    points: 50,
                    tokens: 10
                }
            }
        );
        return result.modifiedCount > 0;
    } catch (err) {
        console.error(`achievementService.unlockBadge error for key ${achievementKey}:`, err);
        return false;
    }
};

/**
 * Evaluates achievement criteria for a user against authoritative server data.
 * @param {String|ObjectId} userId
 * @param {Number|null} currentScore - Authoritative server-calculated current score (optional)
 */
const evaluateUserAchievements = async (userId, currentScore = null) => {
    try {
        await ensureCatalogInitialized();

        const user = await User.findById(userId);
        if (!user) return [];

        const passedTopicsCount = await Progress.countDocuments({ userId, status: 'pass' });

        const unlockedThisRun = [];

        // 1. FIRST_TOPIC
        if (passedTopicsCount >= 1) {
            const unlocked = await unlockBadge(userId, 'FIRST_TOPIC');
            if (unlocked) unlockedThisRun.push('FIRST_TOPIC');
        }

        // 2. TOPIC_MASTER_5
        if (passedTopicsCount >= 5) {
            const unlocked = await unlockBadge(userId, 'TOPIC_MASTER_5');
            if (unlocked) unlockedThisRun.push('TOPIC_MASTER_5');
        }

        // 3. STREAK_3
        if ((user.streak || 0) >= 3) {
            const unlocked = await unlockBadge(userId, 'STREAK_3');
            if (unlocked) unlockedThisRun.push('STREAK_3');
        }

        // 4. STREAK_7
        if ((user.streak || 0) >= 7) {
            const unlocked = await unlockBadge(userId, 'STREAK_7');
            if (unlocked) unlockedThisRun.push('STREAK_7');
        }

        // 5. PERFECT_SCORE (evaluated ONLY from server-calculated currentScore)
        if (typeof currentScore === 'number' && currentScore === 100) {
            const unlocked = await unlockBadge(userId, 'PERFECT_SCORE');
            if (unlocked) unlockedThisRun.push('PERFECT_SCORE');
        }

        // Trigger notifications for any newly unlocked achievements
        for (const key of unlockedThisRun) {
            const achData = CANONICAL_ACHIEVEMENTS.find(a => a.key === key);
            if (achData) {
                await notificationService.notifyAchievement(userId, achData.name);
            }
        }

        return unlockedThisRun;
    } catch (err) {
        console.error('achievementService.evaluateUserAchievements error:', err);
        return [];
    }
};

module.exports = {
    ensureCatalogInitialized,
    unlockBadge,
    evaluateUserAchievements,
    CANONICAL_ACHIEVEMENTS
};
