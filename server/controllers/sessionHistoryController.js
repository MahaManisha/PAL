const SessionHistory = require('../models/SessionHistory');

// @route   POST /api/sessions/log
// @desc    Log a completed Focus Session
// @access  Private
exports.logSession = async (req, res) => {
    try {
        const { 
            topicId, topicName, subjectName, durationSeconds, 
            questionsAttempted, correctAnswers, accuracy, xpEarned, mistakes 
        } = req.body;

        const newSession = new SessionHistory({
            userId: req.user.id,
            topicId,
            topicName,
            subjectName,
            durationSeconds,
            questionsAttempted,
            correctAnswers,
            accuracy,
            xpEarned,
            mistakes: mistakes || []
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (err) {
        console.error('logSession Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @route   GET /api/sessions/history
// @desc    Get user's session history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const sessions = await SessionHistory.find({ userId: req.user.id })
            .sort({ completedAt: -1 }) // Most recent first
            .limit(50); // Optional limit to keep response light
        res.json(sessions);
    } catch (err) {
        console.error('getHistory Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
