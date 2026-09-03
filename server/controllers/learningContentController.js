const LearningContent = require('../models/LearningContent');

exports.getContentByChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const contents = await LearningContent.find({ chapterId }).sort({ order: 1 });
        res.json(contents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getContentByTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const contents = await LearningContent.find({ topicId }).sort({ order: 1 });
        res.json(contents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.addOrUpdateContent = async (req, res) => {
    try {
        const { chapterId, topicId, type, title, driveLink, order } = req.body;
        
        if (!chapterId || !type || !title || !driveLink) {
            return res.status(400).json({ msg: 'Please provide chapterId, type, title, and driveLink' });
        }

        const query = topicId ? { topicId, type } : { chapterId, type, title };
        const update = { chapterId, topicId, type, title, driveLink, order: order || 0 };

        const content = await LearningContent.findOneAndUpdate(
            query,
            update,
            { new: true, upsert: true }
        );

        res.json(content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

