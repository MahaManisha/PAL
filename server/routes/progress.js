const express = require('express');
const router = express.Router();
const { getProgressByUser, getProgressByChapter, startTopic, markLearningComplete, markPracticeComplete } = require('../controllers/progressController');
const { authenticate, authorizeParamUser, authorizeBodyUser } = require('../middleware/auth');

router.get('/:userId', authenticate, authorizeParamUser('userId'), getProgressByUser);
router.get('/chapter/:userId/:chapterId', authenticate, authorizeParamUser('userId'), getProgressByChapter);
router.post('/start', authenticate, authorizeBodyUser('userId'), startTopic);
router.post('/complete-learning', authenticate, authorizeBodyUser('userId'), markLearningComplete);
router.post('/complete-practice', authenticate, authorizeBodyUser('userId'), markPracticeComplete);

module.exports = router;
