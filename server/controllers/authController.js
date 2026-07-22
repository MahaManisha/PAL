const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email, id: user.id } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email, id: user.id } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;
    try {
        console.log('Verifying Google token...');
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: name || 'Google User',
                email,
                googleId
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const jwtPayload = { user: { id: user.id } };
        jwt.sign(jwtPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email, id: user.id } });
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(400).json({ msg: `Google auth error: ${err.message || 'Token verification failed'}` });
    }
};
