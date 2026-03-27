const express = require('express');
const router = express.Router();
const { getProgressByUser, updateProgress } = require('../controllers/progressController');

router.get('/:userId', getProgressByUser);
router.post('/update', updateProgress);

module.exports = router;
