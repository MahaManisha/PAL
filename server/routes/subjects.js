const express = require('express');
const router = express.Router();
const { getSubjects } = require('../controllers/learningController');
router.get('/', getSubjects);
module.exports = router;
