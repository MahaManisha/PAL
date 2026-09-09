const Progress = require('../models/Progress');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const achievementService = require('../services/achievementService');



exports.getPracticeQuestions = async (req, res) => {
    try {
        const { topicId } = req.params;
        const assessment = await Assessment.findOne({ topicId });
        
        if (!assessment || !assessment.questions || assessment.questions.length === 0) {
            return res.status(404).json({ msg: 'No practice questions found for this topic.' });
        }

        // Categorize questions into easy, medium, hard based on index
        const total = assessment.questions.length;
        const bucketSize = Math.max(1, Math.floor(total / 3));

        const practiceQuestions = assessment.questions.map((q, idx) => {
            let difficulty = 'easy';
            if (idx >= bucketSize && idx < bucketSize * 2) {
                difficulty = 'medium';
            } else if (idx >= bucketSize * 2) {
                difficulty = 'hard';
            }
            
            return {
                id: q._id,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer, // Returning it here so frontend can evaluate instantly without extra API calls
                difficulty
            };
        });

        res.json({ questions: practiceQuestions });

    } catch (err) {
        console.error('getPracticeQuestions error:', err);
        res.status(500).send('Server error');
    }
};

exports.submitPracticeSession = async (req, res) => {
    try {
        const { userId, topicId, correctCount, totalQuestions, mistakes } = req.body;
        
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        // Update Progress
        let progress = await Progress.findOne({ userId, topicId });
        let legacyWasPassed = false;
        let effectiveBestScore = score;

        if (progress) {
            legacyWasPassed = progress.status === 'pass';
            if (typeof progress.bestScore === 'number') {
                effectiveBestScore = progress.bestScore;
            } else if (typeof progress.score === 'number') {
                effectiveBestScore = progress.score;
            }
        } else {
            progress = new Progress({ userId, topicId });
        }

        progress.latestScore = score;
        progress.bestScore = Math.max(effectiveBestScore, score);
        progress.score = progress.bestScore;
        progress.status = progress.bestScore >= 70 ? 'pass' : 'fail'; // Assuming 70 is pass

        if (!progress.attempts) {
            progress.attempts = [];
        }

        progress.attempts.push({
            score,
            timestamp: new Date(),
            mistakes: mistakes || []
        });

        if (progress.attempts.length > 5) {
            progress.attempts = progress.attempts.slice(-5);
        }

        let updatedUser = null;

        // Award points for practice (smaller reward than initial assessment pass, but encourages practice)
        const getToday = () => new Date().toISOString().split('T')[0];
        const getYesterday = () => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d.toISOString().split('T')[0];
        };

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
            user.points = (user.points || 0) + 15; // +15 Points for practice
            user.tokens = (user.tokens || 0) + 5;  // +5 Tokens for practice
            await user.save();
            
            updatedUser = {
                id: user._id, name: user.name, points: user.points,
                streak: user.streak, tokens: user.tokens
            };
        }

        await progress.save();

        let newlyUnlockedAchievements = [];
        try {
            newlyUnlockedAchievements = await achievementService.evaluateUserAchievements(userId, score);
        } catch (achErr) {
            console.error('submitPracticeSession: Secondary achievement evaluation error ignored:', achErr);
        }

        res.json({
            score,
            status: progress.status,
            userStats: updatedUser,
            newlyUnlockedAchievements,
            xpEarned: 15
        });

    } catch (err) {
        console.error('submitPracticeSession error:', err);
        res.status(500).send('Server error');
    }
};
