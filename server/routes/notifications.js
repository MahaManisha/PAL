const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get user's recent notifications
// @access  Private
router.get('/', auth, notificationController.getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', auth, notificationController.getUnreadCount);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark specific notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
