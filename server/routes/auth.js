const express = require('express');
const router = express.Router();
const { register, login, googleLogin, updateInterest, updateProfile } = require('../controllers/authController');
const { authenticate, authorizeBodyUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.put('/update-interest', authenticate, authorizeBodyUser('userId'), updateInterest);
router.put('/profile', authenticate, authorizeBodyUser('userId'), updateProfile);

module.exports = router;
