const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const coachController = require('../controllers/coachController');

// @route   GET /api/coach/insight
// @desc    Get AI Coach insight for the current user
// @access  Private
router.get('/insight', authenticate, coachController.getInsight);

module.exports = router;
