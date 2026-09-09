const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');

router.get('/session/:topicId', practiceController.getPracticeQuestions);
router.post('/submit', practiceController.submitPracticeSession);

module.exports = router;
