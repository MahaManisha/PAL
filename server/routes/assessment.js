const express = require('express');
const router = express.Router();
const { getAssessmentByTopic, submitAssessment, getDailyQuest, submitDailyQuest } = require('../controllers/assessmentController');

router.get('/daily-quest/:userId', getDailyQuest);
router.post('/daily-quest/submit', submitDailyQuest);
router.post('/submit', submitAssessment);
router.get('/:topicId', getAssessmentByTopic);

module.exports = router;
