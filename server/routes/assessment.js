const express = require('express');
const router = express.Router();
const { getAssessmentByTopic, getAssessmentByChapter, submitAssessment, getDailyQuest, submitDailyQuest } = require('../controllers/assessmentController');
const { authenticate, authorizeParamUser, authorizeBodyUser } = require('../middleware/auth');

router.get('/daily-quest/:userId', authenticate, authorizeParamUser('userId'), getDailyQuest);
router.post('/daily-quest/submit', authenticate, authorizeBodyUser('userId'), submitDailyQuest);
router.post('/submit', authenticate, authorizeBodyUser('userId'), submitAssessment);
router.get('/:topicId', getAssessmentByTopic);
router.get('/chapter/:chapterId/:type', getAssessmentByChapter);

module.exports = router;
