const jwt = require('jsonwebtoken');
const getJwtSecret = require('../config/jwtSecret');

/**
 * Authentication middleware that verifies JWT and attaches req.user = { id: authenticatedUserId }
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        const authenticatedUserId = decoded.user?.id || decoded.id || decoded.userId;

        if (!authenticatedUserId) {
            return res.status(401).json({ msg: 'Invalid or expired token' });
        }

        req.user = { id: String(authenticatedUserId) };
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token' });
    }
};

/**
 * Authorization middleware verifying that req.params[paramName] matches req.user.id
 */
const authorizeParamUser = (paramName = 'userId') => (req, res, next) => {
    const targetUserId = req.params[paramName];
    if (!targetUserId) {
        return res.status(400).json({ msg: 'User ID missing in request parameters' });
    }
    if (String(req.user.id) !== String(targetUserId)) {
        return res.status(403).json({ msg: 'Forbidden' });
    }
    next();
};

/**
 * Authorization middleware verifying that req.body[bodyField] matches req.user.id
 */
const authorizeBodyUser = (bodyField = 'userId') => (req, res, next) => {
    const targetUserId = req.body[bodyField];
    if (!targetUserId) {
        return res.status(400).json({ msg: 'User ID missing in request body' });
    }
    if (String(req.user.id) !== String(targetUserId)) {
        return res.status(403).json({ msg: 'Forbidden' });
    }
    next();
};

module.exports = {
    authenticate,
    authorizeParamUser,
    authorizeBodyUser
};
