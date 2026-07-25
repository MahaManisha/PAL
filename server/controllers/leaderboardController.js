const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res) => {
    try {
        const currentUserId = req.user ? req.user.id : null;
        const result = await leaderboardService.getLeaderboardForUser(currentUserId);
        res.json(result);
    } catch (err) {
        console.error('leaderboardController.getLeaderboard error:', err);
        res.status(500).json({ msg: 'Unable to load leaderboard' });
    }
};
