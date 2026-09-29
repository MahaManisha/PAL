const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const mongoose = require('mongoose');

const STATIC_SUBJECTS = [
    {
        _id: 'subject_math_12',
        name: 'Mathematics',
        description: 'Grade 12 Mathematics curriculum covering Complex Numbers, Matrices, Vector Algebra, Calculus, and Probability.',
        icon: 'Calculator'
    }
];

const STATIC_CHAPTERS = [
    {
        _id: 'chapter_2',
        subjectId: 'subject_math_12',
        title: 'Chapter 2: Complex Numbers & Quadratic Equations',
        description: 'Fundamentals, algebraic properties, conjugates, modulus, square roots, polar form, and De Moivre theorem.',
        order: 2
    }
];

const STATIC_TOPICS = [
    { _id: 'topic_2_1', chapterId: 'chapter_2', topicName: 'Complex Numbers Fundamentals', order: 1 },
    { _id: 'topic_2_2', chapterId: 'chapter_2', topicName: 'Basic Algebraic Properties of Complex Numbers', order: 2 },
    { _id: 'topic_2_3', chapterId: 'chapter_2', topicName: 'Conjugates and Modulus of Complex Numbers', order: 3 },
    { _id: 'topic_2_4', chapterId: 'chapter_2', topicName: 'Square Root of a Complex Number', order: 4 },
    { _id: 'topic_2_5', chapterId: 'chapter_2', topicName: 'Polar Form and Euler Form', order: 5 },
    { _id: 'topic_2_6', chapterId: 'chapter_2', topicName: 'De Moivre Theorem and Applications', order: 6 }
];

exports.getSubjects = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json(STATIC_SUBJECTS);
        }
        const subjects = await Subject.find();
        res.json(subjects.length > 0 ? subjects : STATIC_SUBJECTS);
    } catch (err) {
        res.json(STATIC_SUBJECTS);
    }
};

exports.getChaptersBySubject = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json(STATIC_CHAPTERS);
        }
        const chapters = await Chapter.find({ subjectId: req.params.subjectId }).sort({ order: 1 });
        res.json(chapters.length > 0 ? chapters : STATIC_CHAPTERS);
    } catch (err) {
        res.json(STATIC_CHAPTERS);
    }
};

exports.getTopicsByChapter = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json(STATIC_TOPICS);
        }
        const topics = await Topic.find({ chapterId: req.params.chapterId }).sort({ order: 1 });
        res.json(topics.length > 0 ? topics : STATIC_TOPICS);
    } catch (err) {
        res.json(STATIC_TOPICS);
    }
};

exports.getTopicById = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const found = STATIC_TOPICS.find(t => t._id === req.params.id) || STATIC_TOPICS[0];
            return res.json({
                ...found,
                chapterId: STATIC_CHAPTERS[0]
            });
        }
        const topic = await Topic.findById(req.params.id).populate({
            path: 'chapterId',
            populate: { path: 'subjectId' }
        });
        res.json(topic || { ...STATIC_TOPICS[0], chapterId: STATIC_CHAPTERS[0] });
    } catch (err) {
        const found = STATIC_TOPICS.find(t => t._id === req.params.id) || STATIC_TOPICS[0];
        res.json({
            ...found,
            chapterId: STATIC_CHAPTERS[0]
        });
    }
};

