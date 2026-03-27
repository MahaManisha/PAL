const express = require('express');
const router = express.Router();
const { getTopicsByChapter, getTopicById } = require('../controllers/learningController');
router.get('/:chapterId', getTopicsByChapter);
router.get('/detail/:id', getTopicById);
module.exports = router;
