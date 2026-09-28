const coachService = require('../services/coachService');

exports.getInsight = async (req, res) => {
    try {
        const insight = await coachService.generateCoachInsight(req.user.id);
        
        // Trigger evaluateAndNotify asynchronously to prevent blocking the response
        coachService.evaluateAndNotify(req.user.id).catch(err => {
            console.error('evaluateAndNotify async error:', err);
        });

        res.json(insight);
    } catch (err) {
        console.error('getInsight Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
