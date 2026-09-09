const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Topic = require('../models/Topic');
const achievementService = require('../services/achievementService');
const dailyQuestService = require('../services/dailyQuestService');
const notificationService = require('../services/notificationService');

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

exports.getAssessmentByTopic = async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ topicId: req.params.topicId });
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });
        res.json(assessment);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getAssessmentByChapter = async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ chapterId: req.params.chapterId, type: req.params.type });
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });
        res.json(assessment);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.submitAssessment = async (req, res) => {
    const { userId, topicId, chapterId, answers } = req.body;
    try {
        // Allow fetching assessment by either topicId or chapterId depending on type
        const query = topicId ? { topicId } : { chapterId };
        const assessment = await Assessment.findOne(query);
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });

        let correctCount = 0;
        const mistakes = [];
        let fetchedTopicName = null;
        let didFetchTopic = false;
        
        // For tracking topic-level scores in INITIAL assessment
        const topicCorrectCounts = {};
        const topicTotalCounts = {};

        for (let index = 0; index < answers.length; index++) {
            const answerData = answers[index];
            let isCorrect = false;
            let q = null;
            let selectedOpt = null;

            if (typeof answerData === 'object' && answerData !== null) {
                q = assessment.questions.find(quest => quest._id.toString() === answerData.questionId);
                if (q) {
                    selectedOpt = answerData.selectedOption;
                    isCorrect = q.correctAnswer === selectedOpt;
                }
            } else {
                q = assessment.questions[index];
                if (q) {
                    selectedOpt = answerData;
                    isCorrect = q.correctAnswer === selectedOpt;
                }
            }

            if (!q) continue;

            if (isCorrect) {
                correctCount++;
            }
            
            // Track topic-level stats if q.topicId exists
            if (q.topicId) {
                const tId = q.topicId.toString();
                if (!topicTotalCounts[tId]) {
                    topicTotalCounts[tId] = 0;
                    topicCorrectCounts[tId] = 0;
                }
                topicTotalCounts[tId]++;
                if (isCorrect) {
                    topicCorrectCounts[tId]++;
                }
            }

            if (!isCorrect) {
                let effectiveTag = (q.conceptTag && typeof q.conceptTag === 'string' && q.conceptTag.trim() !== '') 
                    ? q.conceptTag.trim() 
                    : null;
                
                if (!effectiveTag && topicId) {
                    if (!didFetchTopic) {
                        try {
                            const parentTopic = await Topic.findById(assessment.topicId);
                            if (parentTopic) {
                                fetchedTopicName = parentTopic.topicName;
                            }
                        } catch (err) {
                            console.error('Error fetching parent topic for concept tag fallback', err);
                        }
                        didFetchTopic = true;
                    }
                    effectiveTag = fetchedTopicName || null;
                }

                mistakes.push({
                    questionId: q._id ? q._id.toString() : null,
                    selectedOption: selectedOpt,
                    correctOption: q.correctAnswer,
                    conceptTag: effectiveTag
                });
            }
        }

        const totalQuestions = answers.length > 0 ? answers.length : assessment.questions.length;
        const currentScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        
        // Find existing progress by topicId or chapterId
        const progressQuery = { userId };
        if (topicId) progressQuery.topicId = topicId;
        if (chapterId && !topicId) progressQuery.chapterId = chapterId;
        
        let progress = await Progress.findOne(progressQuery);
        let legacyWasPassed = false;
        let effectiveBestScore = currentScore;
        
        if (progress) {
            legacyWasPassed = progress.status === 'pass';
            if (typeof progress.bestScore === 'number') {
                effectiveBestScore = progress.bestScore;
            } else if (typeof progress.score === 'number') {
                effectiveBestScore = progress.score;
            }
        } else {
            progress = new Progress(progressQuery);
        }

        progress.latestScore = currentScore;
        progress.bestScore = Math.max(effectiveBestScore, currentScore);
        progress.score = progress.bestScore;
        progress.status = progress.bestScore >= assessment.passScore ? 'pass' : 'fail';
        
        // Handle adaptive logic for INITIAL assessment
        if (assessment.type === 'INITIAL') {
            progress.initialAssessmentScore = currentScore;
            
            // Calculate Level and Path Type
            if (currentScore < 40) {
                progress.currentLevel = 'LOW';
                progress.pathType = 'GUIDED';
            } else if (currentScore < 70) {
                progress.currentLevel = 'MEDIUM';
                progress.pathType = 'GUIDED';
            } else {
                progress.currentLevel = 'HIGH';
                progress.pathType = 'DIRECT_MAIN_CONTENT';
            }
            
            // Populate topic scores based on questions answered
            progress.topicScores = Object.keys(topicTotalCounts).map(tId => ({
                topicId: tId,
                score: (topicCorrectCounts[tId] / topicTotalCounts[tId]) * 100
            }));
        } else if (assessment.type === 'FINAL') {
            progress.finalAssessmentScore = currentScore;
        }

        const currentAttemptPasses = currentScore >= assessment.passScore;
        const isFirstPassAndEligible = currentAttemptPasses && !progress.rewardClaimed && !legacyWasPassed;

        if (!progress.attempts) {
            progress.attempts = [];
        }

        progress.attempts.push({
            score: currentScore,
            timestamp: new Date(),
            mistakes
        });

        if (progress.attempts.length > 5) {
            progress.attempts = progress.attempts.slice(-5);
        }

        let updatedUser = null;

        if (isFirstPassAndEligible) {
            progress.rewardClaimed = true;
            
            const user = await User.findById(userId);
            if (user) {
                const today = getToday();
                const yesterday = getYesterday();
                if (user.lastStudyDate === yesterday) {
                    user.streak = (user.streak || 0) + 1;
                } else if (user.lastStudyDate !== today) {
                    user.streak = 1;
                }
                user.lastStudyDate = today;
                user.points = (user.points || 0) + 10;
                user.tokens = (user.tokens || 0) + 5;
                await user.save();
                updatedUser = {
                    id: user._id, name: user.name, email: user.email,
                    interest: user.interest, points: user.points,
                    streak: user.streak, tokens: user.tokens,
                    lastStudyDate: user.lastStudyDate,
                    completedDailyQuestDate: user.completedDailyQuestDate,
                    unlockedBadges: user.unlockedBadges || []
                };
            }
        }

        if (legacyWasPassed) {
            progress.rewardClaimed = true;
        }

        await progress.save();

        let newlyUnlockedAchievements = [];
        // Secondary achievement evaluation (isolated with try/catch)
        try {
            newlyUnlockedAchievements = await achievementService.evaluateUserAchievements(userId, currentScore);
        } catch (achErr) {
            console.error('submitAssessment: Secondary achievement evaluation error ignored:', achErr);
        }

        res.json({ 
            score: progress.score, 
            status: progress.status, 
            user: updatedUser,
            currentLevel: progress.currentLevel,
            topicScores: progress.topicScores,
            newlyUnlockedAchievements
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getDailyQuest = async (req, res) => {
    try {
        const { userId } = req.params;
        const today = dailyQuestService.getToday();

        if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const todaysQuest = await dailyQuestService.getTodayQuest();
        if (!todaysQuest) {
            return res.status(503).json({ msg: 'Daily Quest is temporarily unavailable' });
        }

        const alreadyCompleted = user.completedDailyQuestDate === today;

        res.json({
            question: {
                id: todaysQuest.key,
                questionText: todaysQuest.questionText,
                options: todaysQuest.options,
                topic: todaysQuest.subject
            },
            alreadyCompleted,
            userStats: { points: user.points || 0, streak: user.streak || 0, tokens: user.tokens || 0 }
        });
    } catch (err) {
        console.error('getDailyQuest error:', err);
        res.status(500).send('Server error');
    }
};

exports.submitDailyQuest = async (req, res) => {
    try {
        const { userId, questionId, answer } = req.body;
        const today = dailyQuestService.getToday();

        if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.completedDailyQuestDate === today) {
            return res.json({ msg: 'Already completed today', alreadyCompleted: true, userStats: { points: user.points || 0, streak: user.streak || 0, tokens: user.tokens || 0 } });
        }

        const todaysQuest = await dailyQuestService.getTodayQuest();
        if (!todaysQuest) {
            return res.status(503).json({ msg: 'Daily Quest is temporarily unavailable' });
        }

        // Validate questionId (supports quest key or legacy index)
        const isLegacyMatch = (typeof questionId === 'number' || !isNaN(Number(questionId)));
        let submittedQuestKey = String(questionId);

        if (isLegacyMatch) {
            // Check if submitted numeric index matches today's quest index
            const availableQuests = await require('../models/DailyQuest').find({ available: true }).sort({ key: 1 }).lean();
            const dayOfYear = dailyQuestService.getUtcDayOfYear();
            const expectedIndex = dayOfYear % availableQuests.length;
            if (Number(questionId) !== expectedIndex) {
                return res.status(400).json({ msg: "This is not today's Daily Quest" });
            }
        } else if (submittedQuestKey !== todaysQuest.key) {
            const requestedQuest = await dailyQuestService.getQuestByKey(submittedQuestKey);
            if (!requestedQuest) {
                return res.status(404).json({ msg: 'Daily Quest not found' });
            }
            if (requestedQuest.available === false) {
                return res.status(400).json({ msg: 'Daily Quest unavailable' });
            }
            return res.status(400).json({ msg: "This is not today's Daily Quest" });
        }

        // Validate answer format
        if (typeof answer !== 'number' || answer < 0 || answer >= todaysQuest.options.length) {
            return res.status(400).json({ msg: 'Invalid answer index' });
        }

        const isCorrect = (answer === todaysQuest.correctAnswer);

        let newlyUnlockedAchievements = [];
        if (isCorrect) {
            const yesterday = dailyQuestService.getYesterday();
            let newStreak = 1;
            if (user.lastStudyDate === yesterday) {
                newStreak = (user.streak || 0) + 1;
            } else if (user.lastStudyDate === today) {
                newStreak = user.streak || 1; // Preserve same-day assessment streak!
            }

            // Atomic reward claim update guarding against concurrent submissions
            const updateResult = await User.updateOne(
                {
                    _id: userId,
                    completedDailyQuestDate: { $ne: today }
                },
                {
                    $inc: { points: 1, tokens: 1 },
                    $set: {
                        completedDailyQuestDate: today,
                        lastStudyDate: today,
                        streak: newStreak
                    }
                }
            );

            if (updateResult.modifiedCount === 0) {
                // Concurrent request already claimed today's reward
                const currentU = await User.findById(userId);
                return res.json({ msg: 'Already completed today', alreadyCompleted: true, userStats: { points: currentU.points || 0, streak: currentU.streak || 0, tokens: currentU.tokens || 0 } });
            }

            // Secondary achievement evaluation (isolated with try/catch)
            try {
                newlyUnlockedAchievements = await achievementService.evaluateUserAchievements(userId);
            } catch (achErr) {
                console.error('submitDailyQuest: Secondary achievement evaluation error ignored:', achErr);
            }

            // Notify mission complete
            await notificationService.notifyMissionComplete(userId);
        }

        const updatedUser = await User.findById(userId);

        res.json({
            isCorrect,
            correctAnswer: todaysQuest.correctAnswer,
            userStats: { points: updatedUser.points || 0, streak: updatedUser.streak || 0, tokens: updatedUser.tokens || 0 },
            newlyUnlockedAchievements
        });
    } catch (err) {
        console.error('submitDailyQuest error:', err);
        res.status(500).send('Server error');
    }
};
