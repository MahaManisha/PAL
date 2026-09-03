const Progress = require('../models/Progress');

exports.getProgressByUser = async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.params.userId }).populate('topicId').populate('chapterId');
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getProgressByChapter = async (req, res) => {
    try {
        const { userId, chapterId } = req.params;
        const progress = await Progress.findOne({ userId, chapterId });
        res.json(progress || {});
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.startTopic = async (req, res) => {
    const { userId, topicId } = req.body;
    try {
        let progress = await Progress.findOne({ userId, topicId });
        if (!progress) {
            progress = new Progress({ 
                userId, 
                topicId, 
                score: 0, 
                status: 'in_progress',
                learningCompleted: false,
                practiceCompleted: false
            });
            await progress.save();
        }
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.markLearningComplete = async (req, res) => {
    const { userId, topicId } = req.body;
    try {
        let progress = await Progress.findOne({ userId, topicId });
        if (!progress) {
            progress = new Progress({
                userId,
                topicId,
                score: 0,
                status: 'in_progress'
            });
        }
        progress.learningCompleted = true;
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.markPracticeComplete = async (req, res) => {
    const { userId, topicId } = req.body;
    try {
        let progress = await Progress.findOne({ userId, topicId });
        if (!progress || !progress.learningCompleted) {
            return res.status(400).json({ msg: 'Cannot mark practice complete before learning is complete' });
        }
        progress.practiceCompleted = true;
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
