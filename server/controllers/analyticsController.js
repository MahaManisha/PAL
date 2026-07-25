const mongoose = require('mongoose');
const Progress = require('../models/Progress');

exports.getWeakAreas = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId format defensively to prevent unhandled CastError
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        // Fetch user progress records, populating topic -> chapter -> subject
        const progressRecords = await Progress.find({ userId }).populate({
            path: 'topicId',
            populate: {
                path: 'chapterId',
                populate: {
                    path: 'subjectId'
                }
            }
        });

        if (!progressRecords || progressRecords.length === 0) {
            return res.json({
                userId,
                totalWeakAreas: 0,
                weakAreas: []
            });
        }

        const groupedMap = new Map(); // key: `${normalizedTag}::${topicIdStr}`

        for (const prog of progressRecords) {
            // Graceful omission policy: skip progress records with missing/orphaned topic references
            if (!prog.topicId || !prog.topicId._id) {
                continue;
            }

            const topicDoc = prog.topicId;
            const chapterDoc = topicDoc.chapterId;
            const subjectDoc = chapterDoc ? chapterDoc.subjectId : null;

            const topicIdStr = String(topicDoc._id);
            const topicName = topicDoc.topicName || 'Unknown Topic';
            const subjectIdStr = subjectDoc && subjectDoc._id ? String(subjectDoc._id) : '';
            const subjectName = subjectDoc ? subjectDoc.name || 'Unknown Subject' : '';

            const attempts = Array.isArray(prog.attempts) ? prog.attempts : [];
            const totalAttemptsEvaluated = attempts.length;
            const isMastered = prog.status === 'pass';

            for (const attempt of attempts) {
                const attemptTime = attempt.timestamp ? new Date(attempt.timestamp) : new Date(0);
                const mistakes = Array.isArray(attempt.mistakes) ? attempt.mistakes : [];

                for (const mistake of mistakes) {
                    if (!mistake || typeof mistake.conceptTag !== 'string') continue;

                    const normalizedTag = mistake.conceptTag.trim();
                    if (!normalizedTag || normalizedTag.toLowerCase() === 'general') continue;

                    const groupKey = `${normalizedTag}::${topicIdStr}`;

                    if (!groupedMap.has(groupKey)) {
                        groupedMap.set(groupKey, {
                            conceptTag: normalizedTag,
                            topicId: topicIdStr,
                            topicName,
                            subjectId: subjectIdStr,
                            subjectName,
                            mistakeCount: 0,
                            totalAttemptsEvaluated,
                            latestMistakeTimestamp: attemptTime,
                            isMastered,
                            severity: isMastered ? 'REVIEW_SUGGESTED' : 'NEEDS_REVISION'
                        });
                    }

                    const record = groupedMap.get(groupKey);
                    record.mistakeCount += 1;

                    if (attemptTime > new Date(record.latestMistakeTimestamp)) {
                        record.latestMistakeTimestamp = attemptTime;
                    }
                }
            }
        }

        // Filter by minimum evidence threshold (mistakeCount >= 2)
        const qualifyingWeakAreas = Array.from(groupedMap.values()).filter(item => item.mistakeCount >= 2);

        // Sort qualifying weak areas:
        // 1. mistakeCount descending
        // 2. latestMistakeTimestamp descending
        // 3. conceptTag alphabetical ascending
        // 4. topicId alphabetical ascending
        qualifyingWeakAreas.sort((a, b) => {
            if (b.mistakeCount !== a.mistakeCount) {
                return b.mistakeCount - a.mistakeCount;
            }
            const timeA = new Date(a.latestMistakeTimestamp).getTime();
            const timeB = new Date(b.latestMistakeTimestamp).getTime();
            if (timeB !== timeA) {
                return timeB - timeA;
            }
            const tagCompare = a.conceptTag.localeCompare(b.conceptTag);
            if (tagCompare !== 0) {
                return tagCompare;
            }
            return a.topicId.localeCompare(b.topicId);
        });

        const totalWeakAreas = qualifyingWeakAreas.length;
        const topWeakAreas = qualifyingWeakAreas.slice(0, 5);

        return res.json({
            userId,
            totalWeakAreas,
            weakAreas: topWeakAreas
        });

    } catch (err) {
        console.error('analyticsController.getWeakAreas error:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
};
