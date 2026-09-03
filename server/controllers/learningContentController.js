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
