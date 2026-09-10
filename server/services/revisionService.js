const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Calculates and updates the spaced repetition schedule for a topic progress record.
 * 
 * @param {Object} progressRecord - The mongoose progress document
 * @param {Number} performanceScore - The score achieved (0-100)
 * @returns {Object} The updated progress record (not saved to DB here)
 */
const updateRevisionSchedule = (progressRecord, performanceScore) => {
    let interval = progressRecord.revisionInterval || 0;
    
    if (performanceScore >= 70) {
        // Strong performance: increase interval
        interval = interval === 0 ? 1 : interval * 2.5;
        interval = Math.round(interval);
    } else {
        // Weak performance or fail: reset interval to 1 day
        interval = 1;
    }

    // Ensure at least 1 day
    interval = Math.max(1, interval);

    progressRecord.revisionInterval = interval;
    progressRecord.revisionCount = (progressRecord.revisionCount || 0) + 1;
    progressRecord.lastRevisionDate = new Date();
    
    // Calculate next date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    progressRecord.nextRevisionDate = nextDate;

    return progressRecord;
};

/**
 * Retrieves and categorizes the revision queue for a user.
 */
const getRevisionQueue = async (userId) => {
    const records = await Progress.find({ userId, topicId: { $exists: true, $ne: null } })
        .populate({ path: 'topicId', populate: { path: 'chapterId', populate: { path: 'subjectId' } } })
        .lean();

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const dueNow = [];
    const dueSoon = [];
    const scheduledLater = [];

    records.forEach(record => {
        // Skip if topic data is missing
        if (!record.topicId) return;

        const nextDate = record.nextRevisionDate ? new Date(record.nextRevisionDate) : null;
        
        // Define due condition: 
        // 1. nextRevisionDate is in the past
        // 2. OR status is 'fail'
        // 3. OR it doesn't have a nextRevisionDate but has a low score (legacy data mapping)
        const isFailed = record.status === 'fail';
        const bestScore = record.bestScore !== undefined ? record.bestScore : (record.score || 0);
        const legacyNeedsRevision = !nextDate && bestScore < 70 && record.status !== 'in_progress';

        if (isFailed || legacyNeedsRevision || (nextDate && nextDate <= now)) {
            dueNow.push(record);
        } else if (nextDate && nextDate > now && nextDate <= threeDaysFromNow) {
            dueSoon.push(record);
        } else if (nextDate && nextDate > threeDaysFromNow) {
            scheduledLater.push(record);
        }
    });

    // Sort dueNow by oldest nextRevisionDate first, then by score
    dueNow.sort((a, b) => {
        const dateA = a.nextRevisionDate ? new Date(a.nextRevisionDate).getTime() : 0;
        const dateB = b.nextRevisionDate ? new Date(b.nextRevisionDate).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        const scoreA = a.bestScore !== undefined ? a.bestScore : (a.score || 0);
        const scoreB = b.bestScore !== undefined ? b.bestScore : (b.score || 0);
        return scoreA - scoreB;
    });

    dueSoon.sort((a, b) => new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate));
    scheduledLater.sort((a, b) => new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate));

    return { dueNow, dueSoon, scheduledLater };
};

/**
 * Triggers a smart notification if topics are due for revision.
 * Prevents spam by checking if a REVISION notification was already sent recently (e.g. within 24h).
 */
const triggerRevisionNotification = async (userId) => {
    try {
        const { dueNow } = await getRevisionQueue(userId);
        if (dueNow.length === 0) return;

        // Check if we already notified them recently (within last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentNotif = await Notification.findOne({
            userId,
            type: 'REVISION',
            createdAt: { $gte: yesterday }
        });

        if (recentNotif) return; // Spam prevention

        // Create a new notification
        const topTopic = dueNow[0].topicId;
        const topicName = topTopic.topicName || topTopic.title || 'a topic';
        
        let message = `🔄 ${topicName} is ready for revision. A quick review now can strengthen your mastery.`;
        if (dueNow.length > 1) {
            message = `🔄 ${topicName} and ${dueNow.length - 1} other topics are ready for revision. Keep your mastery strong!`;
        }

        await Notification.create({
            userId,
            type: 'REVISION',
            title: 'Smart Revision Due',
            message,
            actionUrl: '/revision'
        });
    } catch (err) {
        console.error('Failed to trigger revision notification:', err);
    }
};

module.exports = {
    updateRevisionSchedule,
    getRevisionQueue,
    triggerRevisionNotification
};
