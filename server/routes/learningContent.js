const express = require('express');
const router = express.Router();
const learningContentController = require('../controllers/learningContentController');
const { authenticate } = require('../middleware/auth');

router.get('/chapter/:chapterId', authenticate, learningContentController.getContentByChapter);
router.get('/topic/:topicId', authenticate, learningContentController.getContentByTopic);

module.exports = router;
