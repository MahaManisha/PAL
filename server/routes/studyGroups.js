const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studyGroupController = require('../controllers/studyGroupController');

// @route   GET /api/study-groups
// @desc    Get all study groups
// @access  Private
router.get('/', auth, studyGroupController.getGroups);

// @route   POST /api/study-groups
// @desc    Create a new study group
// @access  Private
router.post('/', auth, studyGroupController.createGroup);

// @route   GET /api/study-groups/:id
// @desc    Get single group details and posts
// @access  Private
router.get('/:id', auth, studyGroupController.getGroupById);

// @route   POST /api/study-groups/:id/join
// @desc    Join a study group
// @access  Private
router.post('/:id/join', auth, studyGroupController.joinGroup);

// @route   POST /api/study-groups/:id/leave
// @desc    Leave a study group
// @access  Private
router.post('/:id/leave', auth, studyGroupController.leaveGroup);

// @route   POST /api/study-groups/:id/posts
// @desc    Create a post in a group
// @access  Private
router.post('/:id/posts', auth, studyGroupController.createPost);

// @route   POST /api/study-groups/:id/posts/:postId/reply
// @desc    Reply to a post
// @access  Private
router.post('/:id/posts/:postId/reply', auth, studyGroupController.replyToPost);

module.exports = router;
