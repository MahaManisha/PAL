const recommendationService = require('./recommendationService');
const dailyQuestService = require('./dailyQuestService');
const notificationService = require('./notificationService');
const User = require('../models/User');

/**
 * Generates the current best proactive coaching insight based on user data.
 */
const generateCoachInsight = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const recData = await recommendationService.getRecommendationsForUser(userId);
        const recommendations = recData.recommendations || [];

        // Check for urgent remediation (Priority 1)
        const weakArea = recommendations.find(r => r.type === 'REMEDIATION');
        if (weakArea) {
            return {
                title: 'Needs Remediation',
                message: `You've struggled with ${weakArea.conceptTag} recently. Let's practice this to strengthen your weak area.`,
                ctaLabel: 'Start Practice',
                actionUrl: weakArea.actionUrl,
                contextTag: weakArea.conceptTag || weakArea.topicName,
                signature: `REMEDIATION:${weakArea.topicId}`,
                type: 'REMEDIATION'
            };
        }

        // Check for Daily Mission (Priority 2)
        const today = dailyQuestService.getToday();
        if (user.completedDailyQuestDate !== today) {
            return {
                title: 'Daily Mission Incomplete',
                message: `Don't break your streak! Complete today's GATE-level daily challenge to earn your reward.`,
                ctaLabel: 'View Mission',
                actionUrl: '/dashboard', // The mission is on the dashboard
                contextTag: 'Daily Mission',
                signature: `MISSION:${today}`,
                type: 'MISSION'
            };
        }

        // Check for incomplete topic (Priority 3)
        const continueTopic = recommendations.find(r => r.type === 'CONTINUE');
        if (continueTopic) {
            return {
                title: 'Continue Learning',
                message: `You started ${continueTopic.topicName}. Let's jump back in and finish mastering it!`,
                ctaLabel: 'Resume Topic',
                actionUrl: continueTopic.actionUrl,
                contextTag: continueTopic.topicName,
                signature: `CONTINUE:${continueTopic.topicId}`,
                type: 'CONTINUE'
            };
        }

        // Check for next topic (Priority 4)
        const nextTopic = recommendations.find(r => r.type === 'NEXT_TOPIC');
        if (nextTopic) {
            return {
                title: 'Next Topic Available',
                message: `You're ready for ${nextTopic.topicName}. Start learning to progress through your roadmap.`,
                ctaLabel: 'Start Learning',
                actionUrl: nextTopic.actionUrl,
                contextTag: nextTopic.topicName,
                signature: `NEXT_TOPIC:${nextTopic.topicId}`,
                type: 'NEXT_TOPIC'
            };
        }

        // Check for review (Priority 5)
        const reviewTopic = recommendations.find(r => r.type === 'REVIEW');
        if (reviewTopic) {
            return {
                title: 'Suggested Review',
                message: `You made a few mistakes recently in ${reviewTopic.conceptTag || reviewTopic.topicName}. A quick review could help refresh your memory.`,
                ctaLabel: 'Review Topic',
                actionUrl: reviewTopic.actionUrl,
                contextTag: reviewTopic.conceptTag || reviewTopic.topicName,
                signature: `REVIEW:${reviewTopic.topicId}`,
                type: 'REVIEW'
            };
        }

        // Default: Encouragement
        return {
            title: 'Great Job!',
            message: `You're making excellent progress. Try some adaptive practice or explore your achievements!`,
            ctaLabel: 'Adaptive Practice',
            actionUrl: '/practice',
            contextTag: 'General Study',
            signature: `GENERAL_ENCOURAGEMENT`,
            type: 'ENCOURAGEMENT'
        };

    } catch (err) {
        console.error('generateCoachInsight error:', err);
        return null;
    }
};

/**
 * Checks the latest insight, and if it represents a new actionable priority, fires a notification.
 */
const evaluateAndNotify = async (userId) => {
    try {
        const insight = await generateCoachInsight(userId);
        if (!insight) return;

        const user = await User.findById(userId);
        if (user.lastCoachSignature === insight.signature) {
            return; // Already notified about this exact state, don't spam.
        }

        // Some signatures shouldn't trigger an intrusive bell notification, e.g. general encouragement
        if (insight.type === 'ENCOURAGEMENT') {
            user.lastCoachSignature = insight.signature;
            await user.save();
            return;
        }

        // Fire notification
        await notificationService.createNotification(
            userId,
            'COACH',
            `AI Coach: ${insight.title}`,
            insight.message,
            insight.actionUrl
        );

        user.lastCoachSignature = insight.signature;
        await user.save();

    } catch (err) {
        console.error('coachService.evaluateAndNotify error:', err);
    }
};

module.exports = {
    generateCoachInsight,
    evaluateAndNotify
};
