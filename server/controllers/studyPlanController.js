const mongoose = require('mongoose');
const studyPlanService = require('../services/studyPlanService');

exports.getStudyPlan = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        const data = await studyPlanService.getStudyPlanForUser(userId);
        res.json(data);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ msg: err.message });
        }
        console.error('getStudyPlan controller error:', err);
        res.status(500).json({ msg: 'Unable to generate study plan' });
    }
};
