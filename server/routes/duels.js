const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const duelController = require('../controllers/duelController');

// @route   POST /api/duels/challenge
// @desc    Create a new duel challenge
// @access  Private
router.post('/challenge', authenticate, duelController.createChallenge);

// @route   GET /api/duels/user/me
// @desc    Get user's duels
// @access  Private
router.get('/user/me', authenticate, duelController.getUserDuels);

// @route   GET /api/duels/:id
// @desc    Get duel by id
// @access  Private
router.get('/:id', authenticate, duelController.getDuelById);

// @route   POST /api/duels/:id/accept
// @desc    Accept a duel
// @access  Private
router.post('/:id/accept', authenticate, duelController.acceptChallenge);

// @route   POST /api/duels/:id/decline
// @desc    Decline a duel
// @access  Private
router.post('/:id/decline', authenticate, duelController.declineChallenge);

// @route   POST /api/duels/:id/submit
// @desc    Submit answers for a duel
// @access  Private
router.post('/:id/submit', authenticate, duelController.submitAttempt);

module.exports = router;
