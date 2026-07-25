const recommendationService = require('./recommendationService');

/**
 * Generates a deterministic summary based on the daily plan items.
 */
const generateDeterministicSummary = (items) => {
    if (!items || items.length === 0) {
        return 'No learning actions are currently recommended.';
    }

    const types = new Set(items.map(item => item.type));

    if (types.has('REMEDIATION') && types.has('CONTINUE')) {
        return "Today's plan focuses on strengthening a weak area and continuing your current learning progress.";
    }
    if (types.has('REMEDIATION')) {
        return "Today's plan focuses on reviewing and strengthening weak concepts.";
    }
    if (types.has('CONTINUE')) {
        return "Today's plan focuses on continuing your active learning flow.";
    }
    if (types.has('NEXT_TOPIC')) {
        return "Today's plan starts with your next available topic.";
    }
    if (types.has('REVIEW')) {
        return "Today's plan includes an optional review of previously mastered material.";
    }

    return "Today's plan outlines your recommended learning steps.";
};

/**
 * Generates a deterministic, read-only Daily Study Plan for a user.
 * Reuses recommendationService output. Performs ZERO database writes.
 */
const getStudyPlanForUser = async (userId) => {
    // 1. Fetch authoritative recommendations
    const recommendationData = await recommendationService.getRecommendationsForUser(userId);

    const rawRecommendations = recommendationData?.recommendations || [];

    // 2. Filter to maximum 3 distinct topic items while preserving recommendation priority
    const planItems = [];
    const seenTopics = new Set();

    for (const rec of rawRecommendations) {
        if (planItems.length >= 3) break;
        if (seenTopics.has(rec.topicId)) continue;

        seenTopics.add(rec.topicId);

        planItems.push({
            step: planItems.length + 1,
            type: rec.type,
            topicId: rec.topicId,
            topicName: rec.topicName,
            chapterId: rec.chapterId,
            chapterName: rec.chapterName,
            subjectId: rec.subjectId,
            subjectName: rec.subjectName,
            conceptTag: rec.conceptTag || null,
            reason: rec.reason,
            urgency: rec.urgency,
            actionTab: rec.actionTab,
            actionUrl: rec.actionUrl,
            isMastered: rec.isMastered
        });
    }

    // 3. Generate deterministic summary
    const summary = generateDeterministicSummary(planItems);

    return {
        userId,
        generatedAt: new Date().toISOString(),
        summary,
        totalItems: planItems.length,
        items: planItems
    };
};

module.exports = {
    getStudyPlanForUser,
    generateDeterministicSummary
};
