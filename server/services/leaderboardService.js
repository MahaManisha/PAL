const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');

const LEADERBOARD_LIMIT = 50;

/**
 * Generates an all-time leaderboard using server-authoritative state.
 * Performs ZERO database writes.
 * 
 * @param {String|ObjectId} currentUserId 
 */
const getLeaderboardForUser = async (currentUserId = null) => {
    // 1. Fetch all users with privacy-safe projection (~1 DB read)
    const users = await User.find({})
        .select('name points streak unlockedBadges equipped.avatar equipped.profile_frame createdAt')
        .lean();

    // 2. Aggregate mastered topics (status === 'pass') per user (~1 DB read)
    const masteryAgg = await Progress.aggregate([
        { $match: { status: 'pass' } },
        { $group: { _id: '$userId', masteredTopics: { $sum: 1 } } }
    ]);

    // Build lookup map for masteredTopics count
    const masteryMap = new Map();
    masteryAgg.forEach(item => {
        if (item._id) {
            masteryMap.set(String(item._id), item.masteredTopics);
        }
    });

    // 3. Attach masteredTopics count to each user
    const processedUsers = users.map(user => {
        const uIdStr = String(user._id);
        const masteredTopics = masteryMap.get(uIdStr) || 0;
        const badgeCount = Array.isArray(user.unlockedBadges) ? user.unlockedBadges.length : 0;

        return {
            userId: uIdStr,
            name: user.name || 'Learner',
            points: user.points || 0,
            streak: user.streak || 0,
            masteredTopics,
            badgeCount,
            avatar: (user.equipped && user.equipped.avatar) || '',
            profileFrame: (user.equipped && user.equipped.profile_frame) || '',
            createdAt: user.createdAt || new Date(0)
        };
    });

    // 4. Multi-tier deterministic sorting:
    //    Tier 1: points DESCENDING
    //    Tier 2: masteredTopics DESCENDING
    //    Tier 3: createdAt ASCENDING (earlier account wins tie)
    //    Tier 4: userId ASCENDING (final fallback for complete determinism)
    processedUsers.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        if (b.masteredTopics !== a.masteredTopics) {
            return b.masteredTopics - a.masteredTopics;
        }
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        if (timeA !== timeB) {
            return timeA - timeB;
        }
        return a.userId.localeCompare(b.userId);
    });

    // 5. Assign sequential ordinal ranks (1, 2, 3...)
    const rankedUsers = processedUsers.map((user, index) => {
        const { createdAt, ...publicEntry } = user;
        return {
            ...publicEntry,
            rank: index + 1
        };
    });

    // 6. Extract Top N (Top 50)
    const leaderboard = rankedUsers.slice(0, LEADERBOARD_LIMIT);

    // 7. Find authenticated user's entry (returns separate currentUser object even if outside top 50)
    let currentUser = null;
    if (currentUserId) {
        const targetIdStr = String(currentUserId);
        const found = rankedUsers.find(u => u.userId === targetIdStr);
        if (found) {
            currentUser = found;
        }
    }

    return {
        leaderboard,
        currentUser,
        totalUsers: rankedUsers.length
    };
};

module.exports = {
    getLeaderboardForUser,
    LEADERBOARD_LIMIT
};
