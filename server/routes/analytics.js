const express = require('express');
const router = express.Router();
const { getWeakAreas } = require('../controllers/analyticsController');
const { authenticate, authorizeParamUser } = require('../middleware/auth');

// GET /api/analytics/weak-areas/:userId
router.get('/weak-areas/:userId', authenticate, authorizeParamUser('userId'), getWeakAreas);

module.exports = router;
