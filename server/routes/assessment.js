const express = require('express');
const router = express.Router();
const { getAssessmentByTopic, submitAssessment } = require('../controllers/assessmentController');

router.get('/:topicId', getAssessmentByTopic);
router.post('/submit', submitAssessment);

module.exports = router;
