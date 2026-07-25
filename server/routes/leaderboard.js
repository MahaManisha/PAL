const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const { authenticate } = require('../middleware/auth');

// GET /api/leaderboard — Authenticated all-time leaderboard endpoint
router.get('/', authenticate, getLeaderboard);

module.exports = router;
