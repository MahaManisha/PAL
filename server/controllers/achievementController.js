const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

const CANONICAL_ORDER = ['FIRST_TOPIC', 'TOPIC_MASTER_5', 'STREAK_3', 'STREAK_7', 'PERFECT_SCORE'];

exports.getAchievementsCatalog = async (req, res) => {
    try {
        const catalog = await Achievement.find().lean();
        
        // Sort catalog deterministically according to canonical array order
        catalog.sort((a, b) => {
            const indexA = CANONICAL_ORDER.indexOf(a.key);
            const indexB = CANONICAL_ORDER.indexOf(b.key);
            const posA = indexA !== -1 ? indexA : 999;
            const posB = indexB !== -1 ? indexB : 999;
            return posA - posB;
        });

        res.json(catalog);
    } catch (err) {
        console.error('achievementController.getAchievementsCatalog error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getUserAchievements = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate ObjectId format defensively
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        const user = await User.findById(userId).select('unlockedBadges');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            userId,
            unlockedBadges: user.unlockedBadges || []
        });
    } catch (err) {
        console.error('achievementController.getUserAchievements error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
