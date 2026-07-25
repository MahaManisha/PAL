const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { authenticate, authorizeParamUser } = require('../middleware/auth');

router.get('/:userId', authenticate, authorizeParamUser('userId'), getRecommendations);

module.exports = router;
