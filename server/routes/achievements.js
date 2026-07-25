const express = require('express');
const router = express.Router();
const { getAchievementsCatalog, getUserAchievements } = require('../controllers/achievementController');
const { authenticate, authorizeParamUser } = require('../middleware/auth');

// GET /api/achievements - Fetch read-only catalog (public)
router.get('/', getAchievementsCatalog);

// GET /api/achievements/user/:userId - Fetch user unlocked badges (protected)
router.get('/user/:userId', authenticate, authorizeParamUser('userId'), getUserAchievements);

module.exports = router;
