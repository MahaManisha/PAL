const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

/**
 * Normalizes an ID to a string safely.
 */
const normalizeId = (id) => {
    if (!id) return '';
    if (typeof id === 'object') {
        if (id._id) return String(id._id);
        if (id.id) return String(id.id);
    }
    return String(id);
};

/**
 * Derives effective best score from progress record.
 */
const getEffectiveBestScore = (progress) => {
    if (!progress) return null;
    if (typeof progress.bestScore === 'number') return progress.bestScore;
    if (typeof progress.score === 'number') return progress.score;
    return null;
};

/**
 * Merges progress records for a single topic if multiple exist.
 */
const normalizeProgressForTopic = (progressRecords, targetTopicIdStr) => {
    if (!progressRecords || !Array.isArray(progressRecords) || !targetTopicIdStr) return null;

    const topicRecords = progressRecords.filter(p => p && p.topicId && normalizeId(p.topicId) === targetTopicIdStr);
    if (topicRecords.length === 0) return null;

    const merged = {
        topicId: targetTopicIdStr,
        status: undefined,
        learningCompleted: false,
        practiceCompleted: false,
        effectiveBestScore: null,
        attempts: []
    };

    let hasInProgress = false;
    let hasFail = false;

    topicRecords.forEach(record => {
        if (record.status === 'pass') {
            merged.status = 'pass';
        } else if (record.status === 'in_progress') {
            hasInProgress = true;
        } else if (record.status === 'fail') {
            hasFail = true;
        }

        if (record.learningCompleted) merged.learningCompleted = true;
        if (record.practiceCompleted) merged.practiceCompleted = true;

        const score = getEffectiveBestScore(record);
        if (typeof score === 'number') {
            if (merged.effectiveBestScore === null || score > merged.effectiveBestScore) {
                merged.effectiveBestScore = score;
            }
        }

        if (Array.isArray(record.attempts)) {
            merged.attempts.push(...record.attempts);
        }
    });

    if (merged.status !== 'pass') {
        if (hasInProgress) {
            merged.status = 'in_progress';
        } else if (hasFail) {
            merged.status = 'fail';
        }
    }

    return merged;
};

/**
 * Generates personalized recommendations for a user.
 * Performs ZERO database writes.
 */
const getRecommendationsForUser = async (userId) => {
    // 1. Validate userId format
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        const err = new Error('Invalid user ID format');
        err.statusCode = 400;
        throw err;
    }

    // 2. Verify User existence
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // 3. Batched Queries (1 Progress query + 3 parallel metadata queries)
    const [rawProgressRecords, subjects, chapters, topics] = await Promise.all([
        Progress.find({ userId }).populate('topicId').lean(),
        Subject.find().lean(),
        Chapter.find().lean(),
        Topic.find().lean()
    ]);

    const isBrandNewUser = (rawProgressRecords.length === 0);

    // 4. Sort Subjects deterministically
    subjects.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : null;
        const orderB = typeof b.order === 'number' ? b.order : null;
        if (orderA !== null && orderB !== null && orderA !== orderB) {
            return orderA - orderB;
        }
        const nameA = a.name || a.subjectName || '';
        const nameB = b.name || b.subjectName || '';
        const comp = nameA.localeCompare(nameB);
        if (comp !== 0) return comp;
        return String(a._id).localeCompare(String(b._id));
    });

    // Sort Chapters deterministically
    chapters.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 0;
        const orderB = typeof b.order === 'number' ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;
        return String(a._id).localeCompare(String(b._id));
    });

    // Sort Topics deterministically
    topics.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 0;
        const orderB = typeof b.order === 'number' ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;
        return String(a._id).localeCompare(String(b._id));
    });

    // Build Metadata Maps
    const chapterMap = new Map();
    chapters.forEach(c => chapterMap.set(String(c._id), c));

    const subjectMap = new Map();
    subjects.forEach(s => subjectMap.set(String(s._id), s));

    const topicsByChapterMap = new Map();
    topics.forEach(t => {
        const chapIdStr = String(t.chapterId);
        if (!topicsByChapterMap.has(chapIdStr)) {
            topicsByChapterMap.set(chapIdStr, []);
        }
        topicsByChapterMap.get(chapIdStr).push(t);
    });

    const chaptersBySubjectMap = new Map();
    chapters.forEach(c => {
        const subIdStr = String(c.subjectId);
        if (!chaptersBySubjectMap.has(subIdStr)) {
            chaptersBySubjectMap.set(subIdStr, []);
        }
        chaptersBySubjectMap.get(subIdStr).push(c);
    });

    // 5. Evaluate Topic Accessibility (Chapter Gating)
    const accessibleTopicIds = new Set();
    const topicMetadataMap = new Map(); // topicIdStr -> { topic, chapter, subject, isAccessible }

    subjects.forEach(subject => {
        const subChapters = chaptersBySubjectMap.get(String(subject._id)) || [];
        let isPreviousChapterCompleted = true;

        subChapters.forEach(chapter => {
            const isChapterLocked = !isPreviousChapterCompleted;
            const chapTopics = topicsByChapterMap.get(String(chapter._id)) || [];

            let allTopicsPassed = chapTopics.length > 0;

            chapTopics.forEach(topic => {
                const topicIdStr = String(topic._id);
                const normProg = normalizeProgressForTopic(rawProgressRecords, topicIdStr);

                const isPassed = normProg && normProg.status === 'pass';
                if (!isPassed) {
                    allTopicsPassed = false;
                }

                const isAccessible = !isChapterLocked;
                if (isAccessible) {
                    accessibleTopicIds.add(topicIdStr);
                }

                topicMetadataMap.set(topicIdStr, {
                    topic,
                    chapter,
                    subject,
                    isAccessible,
                    normalizedProgress: normProg
                });
            });

            isPreviousChapterCompleted = allTopicsPassed;
        });
    });

    // 6. Extract Weak Areas using Phase 4 Logic
    const groupedWeakMap = new Map();

    rawProgressRecords.forEach(prog => {
        if (!prog.topicId || !prog.topicId._id) return;

        const topicDoc = prog.topicId;
        const topicIdStr = String(topicDoc._id);
        const meta = topicMetadataMap.get(topicIdStr);
        if (!meta) return;

        const isMastered = (prog.status === 'pass');
        const attempts = Array.isArray(prog.attempts) ? prog.attempts : [];

        attempts.forEach(attempt => {
            const attemptTime = attempt.timestamp ? new Date(attempt.timestamp) : new Date(0);
            const mistakes = Array.isArray(attempt.mistakes) ? attempt.mistakes : [];

            mistakes.forEach(mistake => {
                if (!mistake || typeof mistake.conceptTag !== 'string') return;

                const normalizedTag = mistake.conceptTag.trim();
                if (!normalizedTag || normalizedTag.toLowerCase() === 'general') return;

                const groupKey = `${normalizedTag}::${topicIdStr}`;

                if (!groupedWeakMap.has(groupKey)) {
                    groupedWeakMap.set(groupKey, {
                        conceptTag: normalizedTag,
                        topicId: topicIdStr,
                        topicName: topicDoc.topicName || meta.topic.topicName,
                        chapterId: String(meta.chapter._id),
                        chapterName: meta.chapter.chapterName,
                        subjectId: String(meta.subject._id),
                        subjectName: meta.subject.name || meta.subject.subjectName || 'Unknown Subject',
                        mistakeCount: 0,
                        latestMistakeTimestamp: attemptTime,
                        isMastered,
                        severity: isMastered ? 'REVIEW_SUGGESTED' : 'NEEDS_REVISION',
                        isAccessible: meta.isAccessible
                    });
                }

                const record = groupedWeakMap.get(groupKey);
                record.mistakeCount += 1;
                if (attemptTime > new Date(record.latestMistakeTimestamp)) {
                    record.latestMistakeTimestamp = attemptTime;
                }
            });
        });
    });

    // Qualifying Weak Areas (mistakeCount >= 2)
    const qualifyingWeakAreas = Array.from(groupedWeakMap.values()).filter(w => w.mistakeCount >= 2);

    // Sort weak areas using Phase 4 deterministic ordering
    qualifyingWeakAreas.sort((a, b) => {
        if (b.mistakeCount !== a.mistakeCount) return b.mistakeCount - a.mistakeCount;
        const timeA = new Date(a.latestMistakeTimestamp).getTime();
        const timeB = new Date(b.latestMistakeTimestamp).getTime();
        if (timeB !== timeA) return timeB - timeA;
        const tagComp = a.conceptTag.localeCompare(b.conceptTag);
        if (tagComp !== 0) return tagComp;
        return a.topicId.localeCompare(b.topicId);
    });

    // 7. Construct Priority Recommendations
    const finalRecommendations = [];
    const recommendedTopicIds = new Set();

    // CATEGORY 1: REMEDIATION (Priority 1)
    const remediationItems = qualifyingWeakAreas.filter(w => !w.isMastered && w.isAccessible);
    remediationItems.forEach(w => {
        if (recommendedTopicIds.has(w.topicId)) return; // 1 recommendation per topic

        finalRecommendations.push({
            type: 'REMEDIATION',
            topicId: w.topicId,
            topicName: w.topicName,
            chapterId: w.chapterId,
            chapterName: w.chapterName,
            subjectId: w.subjectId,
            subjectName: w.subjectName,
            conceptTag: w.conceptTag,
            reason: `You made ${w.mistakeCount} recent mistakes in ${w.conceptTag}. Reviewing this topic can strengthen this weak area.`,
            urgency: 'HIGH',
            actionTab: 'learn',
            actionUrl: `/topic/${w.topicId}?tab=learn`,
            isMastered: false
        });
        recommendedTopicIds.add(w.topicId);
    });

    // CATEGORY 2: CONTINUE (Priority 2)
    subjects.forEach(subject => {
        const subChapters = chaptersBySubjectMap.get(String(subject._id)) || [];
        subChapters.forEach(chapter => {
            const chapTopics = topicsByChapterMap.get(String(chapter._id)) || [];
            chapTopics.forEach(topic => {
                const topicIdStr = String(topic._id);
                if (recommendedTopicIds.has(topicIdStr)) return;

                const meta = topicMetadataMap.get(topicIdStr);
                if (!meta || !meta.isAccessible) return;

                const normProg = meta.normalizedProgress;
                if (!normProg || normProg.status === 'pass') return;

                const hasStarted = (normProg.learningCompleted || normProg.practiceCompleted || normProg.status === 'in_progress' || normProg.status === 'fail');

                if (hasStarted) {
                    let actionTab = 'learn';
                    let reason = 'Continue learning this topic before moving to practice.';

                    if (!normProg.learningCompleted) {
                        actionTab = 'learn';
                        reason = 'Continue learning this topic before moving to practice.';
                    } else if (!normProg.practiceCompleted) {
                        actionTab = 'practice';
                        reason = 'You completed the learning material. Continue with practice.';
                    } else {
                        actionTab = 'assessment';
                        reason = 'You completed learning and practice. Take the assessment to continue toward mastery.';
                    }

                    finalRecommendations.push({
                        type: 'CONTINUE',
                        topicId: topicIdStr,
                        topicName: topic.topicName,
                        chapterId: String(chapter._id),
                        chapterName: chapter.chapterName,
                        subjectId: String(subject._id),
                        subjectName: subject.name || subject.subjectName || 'Unknown Subject',
                        conceptTag: null,
                        reason,
                        urgency: 'MEDIUM',
                        actionTab,
                        actionUrl: `/topic/${topicIdStr}?tab=${actionTab}`,
                        isMastered: false
                    });
                    recommendedTopicIds.add(topicIdStr);
                }
            });
        });
    });

    // CATEGORY 3: NEXT_TOPIC (Priority 3)
    let foundNextTopic = false;
    subjects.forEach(subject => {
        if (foundNextTopic) return;
        const subChapters = chaptersBySubjectMap.get(String(subject._id)) || [];
        subChapters.forEach(chapter => {
            if (foundNextTopic) return;
            const chapTopics = topicsByChapterMap.get(String(chapter._id)) || [];
            chapTopics.forEach(topic => {
                if (foundNextTopic) return;
                const topicIdStr = String(topic._id);
                if (recommendedTopicIds.has(topicIdStr)) return;

                const meta = topicMetadataMap.get(topicIdStr);
                if (!meta || !meta.isAccessible) return;

                const normProg = meta.normalizedProgress;
                const isUnstarted = !normProg || (normProg.status !== 'pass' && !normProg.learningCompleted && !normProg.practiceCompleted && normProg.status !== 'in_progress' && normProg.status !== 'fail');

                if (isUnstarted) {
                    const reason = isBrandNewUser
                        ? 'Start your learning journey with the first topic.'
                        : 'This is the next available topic in your learning path.';

                    finalRecommendations.push({
                        type: 'NEXT_TOPIC',
                        topicId: topicIdStr,
                        topicName: topic.topicName,
                        chapterId: String(chapter._id),
                        chapterName: chapter.chapterName,
                        subjectId: String(subject._id),
                        subjectName: subject.name || subject.subjectName || 'Unknown Subject',
                        conceptTag: null,
                        reason,
                        urgency: 'MEDIUM',
                        actionTab: 'learn',
                        actionUrl: `/topic/${topicIdStr}?tab=learn`,
                        isMastered: false
                    });
                    recommendedTopicIds.add(topicIdStr);
                    foundNextTopic = true;
                }
            });
        });
    });

    // CATEGORY 4: REVIEW (Priority 4)
    const reviewItems = qualifyingWeakAreas.filter(w => w.isMastered && w.isAccessible);
    reviewItems.forEach(w => {
        if (recommendedTopicIds.has(w.topicId)) return;

        finalRecommendations.push({
            type: 'REVIEW',
            topicId: w.topicId,
            topicName: w.topicName,
            chapterId: w.chapterId,
            chapterName: w.chapterName,
            subjectId: w.subjectId,
            subjectName: w.subjectName,
            conceptTag: w.conceptTag,
            reason: `You have already mastered this topic, but recent mistakes in ${w.conceptTag} suggest an optional review.`,
            urgency: 'LOW',
            actionTab: 'learn',
            actionUrl: `/topic/${w.topicId}?tab=learn`,
            isMastered: true
        });
        recommendedTopicIds.add(w.topicId);
    });

    // 8. Truncate to Max 5 Recommendations
    const topRecommendations = finalRecommendations.slice(0, 5);
    const primaryRecommendation = topRecommendations.length > 0 ? topRecommendations[0] : null;

    return {
        userId,
        generatedAt: new Date().toISOString(),
        primaryRecommendation,
        recommendations: topRecommendations
    };
};

module.exports = {
    getRecommendationsForUser
};
