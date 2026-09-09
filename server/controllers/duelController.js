const Duel = require('../models/Duel');
const Assessment = require('../models/Assessment');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const User = require('../models/User');
const achievementService = require('../services/achievementService');
const notificationService = require('../services/notificationService');

// Helper to shuffle array
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

exports.createChallenge = async (req, res) => {
    try {
        const { opponentId, subjectId } = req.body;
        const challengerId = req.user.id;

        if (challengerId === opponentId) {
            return res.status(400).json({ msg: "You cannot challenge yourself." });
        }

        // Check for existing pending challenge between these two for this subject
        const existing = await Duel.findOne({
            challengerId,
            opponentId,
            subjectId,
            status: 'PENDING'
        });

        if (existing) {
            return res.status(400).json({ msg: "You already have a pending challenge against this user for this subject." });
        }

        // Fetch questions for this subject
        const chapters = await Chapter.find({ subjectId });
        const chapterIds = chapters.map(c => c._id);
        const topics = await Topic.find({ chapterId: { $in: chapterIds } });
        const topicIds = topics.map(t => t._id);

        const assessments = await Assessment.find({
            $or: [
                { chapterId: { $in: chapterIds } },
                { topicId: { $in: topicIds } }
            ]
        });

        let allQuestions = [];
        assessments.forEach(a => {
            if (a.questions && Array.isArray(a.questions)) {
                allQuestions.push(...a.questions);
            }
        });

        if (allQuestions.length < 5) {
            return res.status(400).json({ msg: "Not enough questions in the bank for this subject to create a duel." });
        }

        const selectedQuestions = shuffleArray(allQuestions).slice(0, 5).map(q => ({
            originalQuestionId: q._id,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            conceptTag: q.conceptTag
        }));

        const duel = new Duel({
            challengerId,
            opponentId,
            subjectId,
            questions: selectedQuestions,
            status: 'PENDING'
        });

        await duel.save();

        const challenger = await User.findById(challengerId);
        await notificationService.notifyDuelChallenge(opponentId, challenger.name || 'A user', duel._id);

        res.status(201).json(duel);
    } catch (err) {
        console.error('createChallenge Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getUserDuels = async (req, res) => {
    try {
        const duels = await Duel.find({
            $or: [
                { challengerId: req.user.id },
                { opponentId: req.user.id }
            ]
        })
        .populate('challengerId', 'name avatarUrl')
        .populate('opponentId', 'name avatarUrl')
        .populate('subjectId', 'name subjectName')
        .sort('-createdAt');

        res.json(duels);
    } catch (err) {
        console.error('getUserDuels Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getDuelById = async (req, res) => {
    try {
        const duel = await Duel.findById(req.params.id)
            .populate('challengerId', 'name avatarUrl')
            .populate('opponentId', 'name avatarUrl')
            .populate('subjectId', 'name subjectName')
            .populate('winnerId', 'name avatarUrl')
            .lean();

        if (!duel) {
            return res.status(404).json({ msg: 'Duel not found' });
        }

        // Verify authorization
        if (duel.challengerId._id.toString() !== req.user.id && duel.opponentId._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view this duel' });
        }

        // Redact correct answers if not completed
        if (duel.status !== 'COMPLETED') {
            duel.questions = duel.questions.map(q => {
                const { correctAnswer, ...rest } = q;
                return rest;
            });
        }

        res.json(duel);
    } catch (err) {
        console.error('getDuelById Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.acceptChallenge = async (req, res) => {
    try {
        const duel = await Duel.findById(req.params.id);
        if (!duel) return res.status(404).json({ msg: 'Duel not found' });

        if (duel.opponentId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Only the opponent can accept' });
        }

        if (duel.status !== 'PENDING') {
            return res.status(400).json({ msg: 'Duel is not pending' });
        }

        duel.status = 'ACCEPTED';
        await duel.save();

        res.json(duel);
    } catch (err) {
        console.error('acceptChallenge Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.declineChallenge = async (req, res) => {
    try {
        const duel = await Duel.findById(req.params.id);
        if (!duel) return res.status(404).json({ msg: 'Duel not found' });

        if (duel.opponentId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Only the opponent can decline' });
        }

        if (duel.status !== 'PENDING') {
            return res.status(400).json({ msg: 'Duel is not pending' });
        }

        duel.status = 'DECLINED';
        await duel.save();

        res.json(duel);
    } catch (err) {
        console.error('declineChallenge Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.submitAttempt = async (req, res) => {
    try {
        const { answers } = req.body; // Array of selected option indices
        const duel = await Duel.findById(req.params.id);

        if (!duel) return res.status(404).json({ msg: 'Duel not found' });

        if (duel.status !== 'ACCEPTED') {
            return res.status(400).json({ msg: 'Duel must be accepted to submit answers' });
        }

        const isChallenger = duel.challengerId.toString() === req.user.id;
        const isOpponent = duel.opponentId.toString() === req.user.id;

        if (!isChallenger && !isOpponent) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (isChallenger && duel.challengerScore !== null) {
            return res.status(400).json({ msg: 'You have already submitted your answers' });
        }

        if (isOpponent && duel.opponentScore !== null) {
            return res.status(400).json({ msg: 'You have already submitted your answers' });
        }

        if (!Array.isArray(answers) || answers.length !== duel.questions.length) {
            return res.status(400).json({ msg: 'Invalid answers format' });
        }

        // Grade
        let score = 0;
        for (let i = 0; i < duel.questions.length; i++) {
            if (answers[i] === duel.questions[i].correctAnswer) {
                score++;
            }
        }

        if (isChallenger) {
            duel.challengerAnswers = answers;
            duel.challengerScore = score;
        } else {
            duel.opponentAnswers = answers;
            duel.opponentScore = score;
        }

        let newlyUnlockedAchievements = [];

        // Check if both have finished
        if (duel.challengerScore !== null && duel.opponentScore !== null) {
            duel.status = 'COMPLETED';

            if (duel.challengerScore > duel.opponentScore) {
                duel.winnerId = duel.challengerId;
            } else if (duel.opponentScore > duel.challengerScore) {
                duel.winnerId = duel.opponentId;
            } else {
                duel.winnerId = null; // Draw
            }

            // Award XP
            const challenger = await User.findById(duel.challengerId);
            const opponent = await User.findById(duel.opponentId);

            if (duel.winnerId && duel.winnerId.toString() === duel.challengerId.toString()) {
                challenger.points = (challenger.points || 0) + 20;
                opponent.points = (opponent.points || 0) + 5;
            } else if (duel.winnerId && duel.winnerId.toString() === duel.opponentId.toString()) {
                opponent.points = (opponent.points || 0) + 20;
                challenger.points = (challenger.points || 0) + 5;
            } else {
                // Draw
                challenger.points = (challenger.points || 0) + 10;
                opponent.points = (opponent.points || 0) + 10;
            }

            await challenger.save();
            await opponent.save();

            // Fire generic achievement evaluation for both
            try {
                const ach1 = await achievementService.evaluateUserAchievements(challenger._id);
                const ach2 = await achievementService.evaluateUserAchievements(opponent._id);
                
                if (req.user.id === challenger._id.toString()) newlyUnlockedAchievements = ach1;
                if (req.user.id === opponent._id.toString()) newlyUnlockedAchievements = ach2;
            } catch (achErr) {
                console.error('submitAttempt achievement evaluation error ignored:', achErr);
            }
        }

        await duel.save();

        res.json({ duel, newlyUnlockedAchievements });
    } catch (err) {
        console.error('submitAttempt Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
