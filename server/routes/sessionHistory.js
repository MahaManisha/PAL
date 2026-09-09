const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionHistoryController = require('../controllers/sessionHistoryController');

router.post('/log', auth, sessionHistoryController.logSession);
router.get('/history', auth, sessionHistoryController.getHistory);

module.exports = router;
