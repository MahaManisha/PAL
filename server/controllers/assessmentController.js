const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');

exports.getAssessmentByTopic = async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ topicId: req.params.topicId });
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });
        res.json(assessment);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.submitAssessment = async (req, res) => {
    const { userId, topicId, answers } = req.body;
    try {
        const assessment = await Assessment.findOne({ topicId });
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });

        let correctCount = 0;
        assessment.questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) {
                correctCount++;
            }
        });

        const score = (correctCount / assessment.questions.length) * 100;
        const status = score >= assessment.passScore ? 'pass' : 'fail';

        const progress = new Progress({
            userId,
            topicId,
            score,
            status
        });

        await progress.save();

        res.json({ score, status });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
