const Notification = require('../models/Notification');

/**
 * Core function to create a notification.
 * Helps prevent exact duplicate spam if a notification with the same title/message is unread.
 */
const createNotification = async (userId, type, title, message, actionUrl = null, metadata = {}) => {
    try {
        // Prevent exact duplicate unread spam (e.g. hitting an endpoint multiple times)
        const recentDuplicate = await Notification.findOne({
            userId,
            title,
            message,
            read: false
        });

        if (recentDuplicate) {
            // Already an unread notification exactly like this, ignore.
            return recentDuplicate;
        }

        const notification = new Notification({
            userId,
            type,
            title,
            message,
            actionUrl,
            metadata
        });

        return await notification.save();
    } catch (err) {
        console.error('notificationService.createNotification error:', err);
        return null;
    }
};

const notifyAchievement = async (userId, achievementName) => {
    return await createNotification(
        userId,
        'ACHIEVEMENT',
        'Achievement Unlocked!',
        `Congratulations! You unlocked ${achievementName}.`,
        '/achievements'
    );
};

const notifyDuelChallenge = async (opponentId, challengerName, duelId) => {
    return await createNotification(
        opponentId,
        'DUEL',
        'New Duel Challenge',
        `You've been challenged to a Mock Test Duel by ${challengerName}.`,
        `/duel/${duelId}`
    );
};

const notifyStudyGroupPost = async (members, authorName, groupName, groupId) => {
    // notify multiple members (excluding author if caller didn't exclude them, caller should probably exclude)
    for (const memberId of members) {
        await createNotification(
            memberId,
            'STUDY_GROUP',
            'New Group Activity',
            `${authorName} posted a new discussion in ${groupName}.`,
            `/study-groups/${groupId}`
        );
    }
};

const notifyMissionComplete = async (userId) => {
    return await createNotification(
        userId,
        'MISSION',
        'Mission Accomplished!',
        'You have successfully completed your Daily Mission.',
        '/dashboard'
    );
};

module.exports = {
    createNotification,
    notifyAchievement,
    notifyDuelChallenge,
    notifyStudyGroupPost,
    notifyMissionComplete
};
