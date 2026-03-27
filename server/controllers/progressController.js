const Progress = require('../models/Progress');

exports.getProgressByUser = async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.params.userId }).populate('topicId');
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateProgress = async (req, res) => {
    const { userId, topicId, score, status } = req.body;
    try {
        let progress = await Progress.findOne({ userId, topicId });
        if (progress) {
            progress.score = score;
            progress.status = status;
        } else {
            progress = new Progress({ userId, topicId, score, status });
        }
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
