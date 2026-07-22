const express = require('express');
const router = express.Router();
const { register, login, googleLogin, updateInterest } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.put('/update-interest', updateInterest);

module.exports = router;
