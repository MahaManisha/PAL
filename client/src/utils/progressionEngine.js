export const normalizeId = (id) => {
    if (!id) return '';
    if (typeof id === 'object') {
        if (id._id) return String(id._id);
        if (id.id) return String(id.id);
    }
    return String(id);
};

export const getEffectiveBestScore = (progress) => {
    if (!progress) return null;
    if (typeof progress.bestScore === 'number') {
        return progress.bestScore;
    }
    if (typeof progress.score === 'number') {
        return progress.score;
    }
    return null;
};

export const normalizeProgress = (progressRecords, topicId) => {
    if (!progressRecords || !Array.isArray(progressRecords)) return null;

    const targetTopicIdStr = normalizeId(topicId);
    if (!targetTopicIdStr) return null;

    const topicRecords = progressRecords.filter(p => {
        if (!p || !p.topicId) return false;
        return normalizeId(p.topicId) === targetTopicIdStr;
    });

    if (topicRecords.length === 0) return null;

    const merged = {
        topicId: targetTopicIdStr,
        status: undefined,
        learningCompleted: false,
        practiceCompleted: false,
        effectiveBestScore: null
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

        if (record.learningCompleted) {
            merged.learningCompleted = true;
        }
        if (record.practiceCompleted) {
            merged.practiceCompleted = true;
        }

        const score = getEffectiveBestScore(record);
        if (typeof score === 'number') {
            if (merged.effectiveBestScore === null || score > merged.effectiveBestScore) {
                merged.effectiveBestScore = score;
            }
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

export const calculateTopicState = (topic, normalizedProgress, isParentChapterLocked) => {
    if (isParentChapterLocked) return 'LOCKED';
    if (!normalizedProgress) return 'NOT_STARTED';
    
    if (normalizedProgress.status === 'pass') return 'PASSED';
    if (normalizedProgress.status === 'fail') return 'NEEDS_REVISION';
    if (normalizedProgress.practiceCompleted) return 'ASSESSMENT_READY';
    if (normalizedProgress.learningCompleted) return 'PRACTICING';
    
    return 'LEARNING';
};

export const calculateChapterState = (chapter, progressRecords, isPreviousChapterCompleted) => {
    if (!isPreviousChapterCompleted) return 'LOCKED';
    
    const topics = chapter?.topics || [];
    if (topics.length === 0) return 'NOT_STARTED'; // Empty chapters don't complete themselves

    let allPassed = true;
    let anyProgress = false;

    for (const topic of topics) {
        const topicIdStr = normalizeId(topic._id || topic.id);
        const normalized = normalizeProgress(progressRecords, topicIdStr);
        const state = calculateTopicState(topic, normalized, false);
        
        if (state !== 'PASSED') {
            allPassed = false;
        }
        if (state !== 'NOT_STARTED') {
            anyProgress = true;
        }
    }

    if (allPassed) return 'COMPLETED';
    if (!anyProgress) return 'NOT_STARTED';
    return 'IN_PROGRESS';
};

export const calculateChapterProgress = (chapter, progressRecords) => {
    const topics = chapter?.topics || [];
    const topicCount = topics.length;
    
    if (topicCount === 0) {
        return { topicCount: 0, completedTopics: 0, progressPercentage: 0 };
    }

    let completedTopics = 0;
    for (const topic of topics) {
        const topicIdStr = normalizeId(topic._id || topic.id);
        const normalized = normalizeProgress(progressRecords, topicIdStr);
        if (normalized && normalized.status === 'pass') {
            completedTopics++;
        }
    }

    const progressPercentage = Math.round((completedTopics / topicCount) * 100);
    return { topicCount, completedTopics, progressPercentage };
};

export const findCurrentChapter = (chapters, progressRecords) => {
    if (!chapters || !Array.isArray(chapters)) return null;

    let isPreviousCompleted = true;
    let firstNotStarted = null;

    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const state = calculateChapterState(chapter, progressRecords, isPreviousCompleted);

        if (state === 'IN_PROGRESS') {
            return chapter;
        }
        
        if (state === 'NOT_STARTED' && !firstNotStarted) {
            firstNotStarted = chapter;
        }

        isPreviousCompleted = state === 'COMPLETED';
    }

    return firstNotStarted;
};

export const getMasteryBand = (effectiveBestScore) => {
    if (typeof effectiveBestScore !== 'number' || isNaN(effectiveBestScore) || effectiveBestScore === Infinity || effectiveBestScore === -Infinity) {
        return 'NONE';
    }

    if (effectiveBestScore < 0 || effectiveBestScore > 100) return 'NONE';

    if (effectiveBestScore >= 85) return 'HIGH';
    if (effectiveBestScore >= 70) return 'STANDARD';
    return 'NEEDS_IMPROVEMENT';
};

export const determineNextAction = (subjectId, chapters, progressRecords) => {
    if (!chapters || !Array.isArray(chapters)) {
        return null;
    }

    let previousChapterCompleted = true;

    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const chapterState = calculateChapterState(chapter, progressRecords, previousChapterCompleted);

        if (chapterState === 'LOCKED') break;

        if (chapterState === 'IN_PROGRESS' || chapterState === 'NOT_STARTED') {
            const topics = chapter.topics || [];
            
            // Priority 1: Check for failed assessment / NEEDS_REVISION in the current chapter
            for (let j = 0; j < topics.length; j++) {
                const topic = topics[j];
                const topicIdStr = normalizeId(topic._id || topic.id);
                const normalized = normalizeProgress(progressRecords, topicIdStr);
                const state = calculateTopicState(topic, normalized, false);
                
                if (state === 'NEEDS_REVISION') {
                    return {
                        type: 'REVIEW_TOPIC',
                        subjectId,
                        chapterId: normalizeId(chapter._id || chapter.id),
                        topicId: topicIdStr,
                        route: `/topic/${topicIdStr}`,
                        title: topic.topicName || topic.title || 'Topic',
                        description: 'Review the material before retaking the assessment.',
                        reason: 'Assessment failed',
                        priority: 'primary',
                        progressState: state
                    };
                }
            }

            // Priority 2: Find the first incomplete topic in the normal flow
            let previousTopicPassed = false;
            
            for (let j = 0; j < topics.length; j++) {
                const topic = topics[j];
                const topicIdStr = normalizeId(topic._id || topic.id);
                const normalized = normalizeProgress(progressRecords, topicIdStr);
                const state = calculateTopicState(topic, normalized, false);

                if (state !== 'PASSED') {
                    let actionType = 'START_TOPIC'; // default for NOT_STARTED
                    
                    if (state === 'NOT_STARTED') {
                        if (previousTopicPassed) {
                            actionType = 'START_NEXT_TOPIC';
                        } else if (j === 0 && previousChapterCompleted && i > 0) {
                            actionType = 'START_NEXT_CHAPTER';
                        } else {
                            actionType = 'START_TOPIC';
                        }
                    } else if (state === 'LEARNING') {
                        actionType = 'CONTINUE_LEARNING';
                    } else if (state === 'PRACTICING') {
                        actionType = 'START_PRACTICE';
                    } else if (state === 'ASSESSMENT_READY') {
                        actionType = 'TAKE_ASSESSMENT';
                    }

                    const route = (actionType === 'TAKE_ASSESSMENT') 
                        ? `/assessment/${topicIdStr}`
                        : `/topic/${topicIdStr}`;

                    return {
                        type: actionType,
                        subjectId,
                        chapterId: normalizeId(chapter._id || chapter.id),
                        topicId: topicIdStr,
                        route,
                        title: topic.topicName || topic.title || 'Topic',
                        description: 'Continue your learning journey.',
                        reason: 'Next in path',
                        priority: 'primary',
                        progressState: state
                    };
                }
                
                previousTopicPassed = state === 'PASSED';
            }
        }

        previousChapterCompleted = chapterState === 'COMPLETED';
    }

    // If all chapters are COMPLETED
    if (previousChapterCompleted && chapters.length > 0) {
        return {
            type: 'SUBJECT_COMPLETE',
            subjectId,
            chapterId: null,
            topicId: null,
            route: null,
            title: 'Subject Complete',
            description: 'You have mastered all chapters in this subject.',
            reason: 'All topics passed',
            priority: 'primary',
            progressState: 'PASSED'
        };
    }

    return null;
};
