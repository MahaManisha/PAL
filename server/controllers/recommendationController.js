const mongoose = require('mongoose');
const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        const data = await recommendationService.getRecommendationsForUser(userId);
        res.json(data);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ msg: err.message });
        }
        console.error('getRecommendations controller error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
