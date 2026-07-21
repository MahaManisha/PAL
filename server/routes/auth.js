const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, googleAuth } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
        const payload = { user: { id: req.user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // Redirect to frontend with token
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/google?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&id=${req.user.id}&avatar=${encodeURIComponent(req.user.avatar || '')}`);
        });
    }
);

// Alternative: Google token-based auth for client-side Google One Tap / Popup
router.post('/google/token', googleAuth);

module.exports = router;
