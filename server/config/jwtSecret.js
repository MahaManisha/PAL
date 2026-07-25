/**
 * Resolves JWT secret safely based on environment posture.
 * In production: throws if process.env.JWT_SECRET is missing.
 * In dev/test: falls back to 'secret' for test compatibility.
 */
const getJwtSecret = () => {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment.');
    }
    return process.env.JWT_SECRET || 'secret';
};

module.exports = getJwtSecret;
