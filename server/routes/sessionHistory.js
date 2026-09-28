const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const sessionHistoryController = require('../controllers/sessionHistoryController');

router.post('/log', authenticate, sessionHistoryController.logSession);
router.get('/history', authenticate, sessionHistoryController.getHistory);

module.exports = router;
