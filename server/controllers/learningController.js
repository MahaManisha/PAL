const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getChaptersBySubject = async (req, res) => {
    try {
        const chapters = await Chapter.find({ subjectId: req.params.subjectId }).sort({ order: 1 });
        res.json(chapters);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getTopicsByChapter = async (req, res) => {
    try {
        const topics = await Topic.find({ chapterId: req.params.chapterId }).sort({ order: 1 });
        res.json(topics);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id).populate({
            path: 'chapterId',
            populate: { path: 'subjectId' }
        });
        res.json(topic);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
