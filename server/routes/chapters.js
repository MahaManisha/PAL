const express = require('express');
const router = express.Router();
const { getChaptersBySubject } = require('../controllers/learningController');
router.get('/:subjectId', getChaptersBySubject);
module.exports = router;
