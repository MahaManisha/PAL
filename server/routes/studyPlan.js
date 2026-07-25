const express = require('express');
const router = express.Router();
const { getStudyPlan } = require('../controllers/studyPlanController');
const { authenticate, authorizeParamUser } = require('../middleware/auth');

router.get('/:userId', authenticate, authorizeParamUser('userId'), getStudyPlan);

module.exports = router;
