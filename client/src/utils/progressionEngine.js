export const normalizeId = (id) => {
    if (!id) return '';
    if (typeof id === 'object') {
        if (id._id) return String(id._id);
        if (id.id) return String(id.id);
    }
    return String(id);
};

export const ADAPTIVE_THRESHOLDS = {
    LOW_MAX: 39,
    MEDIUM_MAX: 69,
    HIGH_MIN: 70
};

export const TOPIC_THRESHOLDS = {
    WEAK_MAX: 39,
    MODERATE_MAX: 69,
    STRONG_MIN: 70
};

export const determineOverallLevel = (score) => {
    if (score <= ADAPTIVE_THRESHOLDS.LOW_MAX) return 'LOW';
    if (score <= ADAPTIVE_THRESHOLDS.MEDIUM_MAX) return 'MEDIUM';
    return 'HIGH';
};

export const determineTopicStatus = (topicScore) => {
    if (topicScore <= TOPIC_THRESHOLDS.WEAK_MAX) return 'WEAK';
    if (topicScore <= TOPIC_THRESHOLDS.MODERATE_MAX) return 'MODERATE';
    return 'STRONG';
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

export const normalizeProgress = (progressRecords, topicId, chapterProgress) => {
    if (!progressRecords || !Array.isArray(progressRecords)) return null;

    const targetTopicIdStr = normalizeId(topicId);
    if (!targetTopicIdStr) return null;

    const topicRecords = progressRecords.filter(p => {
        if (!p || !p.topicId) return false;
        return normalizeId(p.topicId) === targetTopicIdStr;
    });

    const merged = {
        topicId: targetTopicIdStr,
        status: undefined,
        learningCompleted: false,
        practiceCompleted: false,
        effectiveBestScore: null,
        initialScore: null,
        topicStatus: null
    };

    if (chapterProgress && chapterProgress.topicScores) {
        const ts = chapterProgress.topicScores.find(t => normalizeId(t.topicId) === targetTopicIdStr);
        if (ts) {
            merged.initialScore = ts.score;
            merged.topicStatus = determineTopicStatus(ts.score);
        }
    }

    if (topicRecords.length === 0 && merged.initialScore === null) return null;

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

export const calculateTopicState = (topic, normalizedProgress, isParentChapterLocked, chapterProgress) => {
    if (isParentChapterLocked) return 'LOCKED';
    
    if (chapterProgress && chapterProgress.pathType) {
        if (chapterProgress.pathType === 'DIRECT_MAIN_CONTENT') {
            return 'SKIPPED';
        }
        if (chapterProgress.pathType === 'GUIDED' && normalizedProgress?.topicStatus === 'STRONG') {
            return 'SKIPPED';
        }
    }
    
    if (!normalizedProgress || (normalizedProgress.status === undefined && normalizedProgress.initialScore !== null)) {
        return 'NOT_STARTED';
    }
    
    if (normalizedProgress.status === 'pass') return 'PASSED';
    if (normalizedProgress.status === 'fail') return 'NEEDS_REVISION';
    if (normalizedProgress.practiceCompleted) return 'ASSESSMENT_READY';
    if (normalizedProgress.learningCompleted) return 'PRACTICING';
    
    return 'LEARNING';
};

export const calculateChapterState = (chapter, progressRecords, isPreviousChapterCompleted) => {
    const chapterIdStr = normalizeId(chapter._id || chapter.id);
    const chapterProgress = progressRecords.find(p => p.chapterId && normalizeId(p.chapterId._id || p.chapterId) === chapterIdStr);
    
    const hasPassedInitial = chapterProgress && chapterProgress.initialAssessmentScore !== undefined && chapterProgress.currentLevel !== 'PENDING';
    
    const topics = chapter?.topics || [];
    if (topics.length === 0) {
        if (!hasPassedInitial) return 'NOT_STARTED';
        if (chapterProgress && chapterProgress.finalAssessmentScore !== undefined) return 'COMPLETED';
        return 'IN_PROGRESS';
    }

    if (chapterProgress && chapterProgress.pathType === 'DIRECT_MAIN_CONTENT') {
        if (chapterProgress.finalAssessmentScore !== undefined) return 'COMPLETED';
        return 'IN_PROGRESS';
    }

    let allRequiredPassed = true;
    let anyProgress = false;

    for (const topic of topics) {
        const topicIdStr = normalizeId(topic._id || topic.id);
        const normalized = normalizeProgress(progressRecords, topicIdStr, chapterProgress);
        const state = calculateTopicState(topic, normalized, !hasPassedInitial, chapterProgress);
        
        if (state !== 'PASSED' && state !== 'SKIPPED') {
            allRequiredPassed = false;
        }
        if (state !== 'NOT_STARTED' && state !== 'LOCKED' && state !== 'SKIPPED') {
            anyProgress = true;
        }
    }

    if (allRequiredPassed) {
        if (chapterProgress && chapterProgress.finalAssessmentScore !== undefined) return 'COMPLETED';
        return 'IN_PROGRESS'; 
    }
    if (!anyProgress && !hasPassedInitial) return 'NOT_STARTED';
    return 'IN_PROGRESS';
};

export const calculateChapterProgress = (chapter, progressRecords) => {
    const topics = chapter?.topics || [];
    const topicCount = topics.length;
    
    if (topicCount === 0) {
        return { topicCount: 0, completedTopics: 0, progressPercentage: 0 };
    }

    const chapterIdStr = normalizeId(chapter._id || chapter.id);
    const chapterProgress = progressRecords.find(p => p.chapterId && normalizeId(p.chapterId._id || p.chapterId) === chapterIdStr);

    let completedTopics = 0;
    for (const topic of topics) {
        const topicIdStr = normalizeId(topic._id || topic.id);
        const normalized = normalizeProgress(progressRecords, topicIdStr, chapterProgress);
        const state = calculateTopicState(topic, normalized, false, chapterProgress);
        if (state === 'PASSED' || state === 'SKIPPED') {
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
        const chapterIdStr = normalizeId(chapter._id || chapter.id);
        const chapterProgress = progressRecords.find(p => p.chapterId && normalizeId(p.chapterId._id || p.chapterId) === chapterIdStr);

        if (chapterState === 'LOCKED') break;

        if (chapterState === 'IN_PROGRESS' || chapterState === 'NOT_STARTED') {
            const hasPassedInitial = chapterProgress && chapterProgress.initialAssessmentScore !== undefined && chapterProgress.currentLevel !== 'PENDING';
            
            if (!hasPassedInitial) {
                return {
                    type: 'START_INITIAL_ASSESSMENT',
                    subjectId,
                    chapterId: chapterIdStr,
                    topicId: null,
                    route: `/chapter/${chapterIdStr}/trailer`,
                    title: 'Initial Assessment',
                    description: 'Take the initial assessment to unlock your personalized learning path.',
                    reason: 'Required for adaptive path',
                    priority: 'primary',
                    progressState: 'NOT_STARTED'
                };
            }

            if (chapterProgress.pathType === 'DIRECT_MAIN_CONTENT') {
                if (chapterProgress.finalAssessmentScore === undefined) {
                    return {
                        type: 'CONTINUE_LEARNING',
                        subjectId,
                        chapterId: chapterIdStr,
                        topicId: null,
                        route: `/slides/${chapterIdStr}/main`,
                        title: 'Main Chapter Content',
                        description: 'View the main presentation for this chapter.',
                        reason: 'HIGH path',
                        priority: 'primary',
                        progressState: 'NOT_STARTED'
                    };
                }
            } else {
                const topics = chapter.topics || [];
                
                // Priority 1: NEEDS_REVISION
                for (let j = 0; j < topics.length; j++) {
                    const topic = topics[j];
                    const topicIdStr = normalizeId(topic._id || topic.id);
                    const normalized = normalizeProgress(progressRecords, topicIdStr, chapterProgress);
                    const state = calculateTopicState(topic, normalized, false, chapterProgress);
                    
                    if (state === 'NEEDS_REVISION') {
                        return {
                            type: 'REVIEW_TOPIC',
                            subjectId,
                            chapterId: chapterIdStr,
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

                // Priority 2: Next incomplete required topic
                let previousTopicPassed = false;
                let foundAction = false;
                
                for (let j = 0; j < topics.length; j++) {
                    const topic = topics[j];
                    const topicIdStr = normalizeId(topic._id || topic.id);
                    const normalized = normalizeProgress(progressRecords, topicIdStr, chapterProgress);
                    const state = calculateTopicState(topic, normalized, false, chapterProgress);

                    if (state !== 'PASSED' && state !== 'SKIPPED') {
                        let actionType = 'START_TOPIC';
                        
                        if (state === 'NOT_STARTED') {
                            if (previousTopicPassed) {
                                actionType = 'START_NEXT_TOPIC';
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
                            chapterId: chapterIdStr,
                            topicId: topicIdStr,
                            route,
                            title: topic.topicName || topic.title || 'Topic',
                            description: 'Continue your personalized learning journey.',
                            reason: 'Required topic based on assessment',
                            priority: 'primary',
                            progressState: state
                        };
                    }
                    
                    previousTopicPassed = (state === 'PASSED' || state === 'SKIPPED');
                }
            }

            // Priority 3: Final Assessment if all learning is done
            if (chapterProgress.finalAssessmentScore === undefined) {
                return {
                    type: 'TAKE_ASSESSMENT',
                    subjectId,
                    chapterId: chapterIdStr,
                    topicId: null,
                    route: `/chapter/${chapterIdStr}/final-assessment`,
                    title: 'Final Assessment',
                    description: 'Take the final assessment for this chapter.',
                    reason: 'All learning completed',
                    priority: 'primary',
                    progressState: 'ASSESSMENT_READY'
                };
            }
        }

        previousChapterCompleted = chapterState === 'COMPLETED';
    }

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
