const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const { updateInterest } = require('./controllers/authController');
const { authenticate, authorizeBodyUser, authorizeParamUser } = require('./middleware/auth');
const getJwtSecret = require('./config/jwtSecret');

const generateToken = (userId, expiresIn = '1h') => {
    return jwt.sign({ user: { id: String(userId) } }, getJwtSecret(), { expiresIn });
};

const createMockReqRes = (headers = {}, params = {}, body = {}) => {
    const req = {
        headers,
        params,
        body
    };

    let statusCode = 200;
    let jsonResponse = null;

    const res = {
        status: function(code) {
            statusCode = code;
            return this;
        },
        json: function(data) {
            jsonResponse = data;
            return this;
        },
        send: function(data) {
            jsonResponse = data;
            return this;
        }
    };

    return { req, res, getStatus: () => statusCode, getJson: () => jsonResponse };
};

const runMiddlewareChain = async (middlewares, req, resObj) => {
    const { res, getStatus } = resObj;
    for (const mw of middlewares) {
        let nextCalled = false;
        await new Promise((resolve) => {
            mw(req, res, (err) => {
                nextCalled = true;
                resolve();
            });
            setTimeout(resolve, 30);
        });

        if (!nextCalled || getStatus() !== 200) {
            break;
        }
    }
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 7 Stage 2 Security Testing...');

    await User.deleteMany({ email: { $in: ['p7_usera@test.com', 'p7_userb@test.com'] } });

    const userA = await User.create({ name: 'User P7A', email: 'p7_usera@test.com', interest: 'none', subTheme: 'corporate' });
    const userB = await User.create({ name: 'User P7B', email: 'p7_userb@test.com', interest: 'none', subTheme: 'corporate' });

    const tokenA = generateToken(userA._id);
    const expiredTokenA = generateToken(userA._id, '-1s');

    // 1. update-interest without JWT -> 401
    const mock1 = createMockReqRes({}, {}, { userId: userA._id.toString(), interest: 'gamified' });
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock1.req, mock1);
    console.log('Case 1 (update-interest without JWT -> 401):', mock1.getStatus() === 401 ? 'PASS' : 'FAIL');

    // 2. update-interest malformed Authorization header -> 401
    const mock2 = createMockReqRes({ authorization: 'Basic 12345' }, {}, { userId: userA._id.toString(), interest: 'gamified' });
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock2.req, mock2);
    console.log('Case 2 (update-interest malformed header -> 401):', mock2.getStatus() === 401 ? 'PASS' : 'FAIL');

    // 3. update-interest invalid JWT -> 401
    const mock3 = createMockReqRes({ authorization: 'Bearer invalid_token' }, {}, { userId: userA._id.toString(), interest: 'gamified' });
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock3.req, mock3);
    console.log('Case 3 (update-interest invalid JWT -> 401):', mock3.getStatus() === 401 ? 'PASS' : 'FAIL');

    // 4. update-interest expired JWT -> 401
    const mock4 = createMockReqRes({ authorization: `Bearer ${expiredTokenA}` }, {}, { userId: userA._id.toString(), interest: 'gamified' });
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock4.req, mock4);
    console.log('Case 4 (update-interest expired JWT -> 401):', mock4.getStatus() === 401 ? 'PASS' : 'FAIL');

    // 5. update-interest valid JWT + matching userId -> allowed (200)
    const mock5 = createMockReqRes(
        { authorization: `Bearer ${tokenA}` },
        {},
        { userId: userA._id.toString(), interest: 'gamified', subTheme: 'rpg' }
    );
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock5.req, mock5);
    if (mock5.getStatus() === 200) {
        await updateInterest(mock5.req, mock5.res);
    }
    const updatedUserA = await User.findById(userA._id);
    console.log('Case 5 (valid JWT own update-interest -> 200 & DB updated):', mock5.getStatus() === 200 && updatedUserA.interest === 'gamified' && updatedUserA.subTheme === 'rpg' ? 'PASS' : 'FAIL');

    // 6 & 7. update-interest valid JWT User A + User B userId -> 403 & ZERO victim mutation
    const mock6 = createMockReqRes(
        { authorization: `Bearer ${tokenA}` },
        {},
        { userId: userB._id.toString(), interest: 'cinematic', subTheme: 'noir' }
    );
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock6.req, mock6);
    const freshUserB = await User.findById(userB._id);
    const userBUnchanged = freshUserB.interest === 'none' && freshUserB.subTheme === 'corporate';
    console.log('Case 6 & 7 (cross-user update-interest -> 403 & ZERO victim mutation):', mock6.getStatus() === 403 && userBUnchanged ? 'PASS' : 'FAIL');

    // 15. JWT_SECRET production safety test
    let envSecretThrow = false;
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.JWT_SECRET;

    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    try {
        getJwtSecret();
    } catch (e) {
        envSecretThrow = e.message.includes('JWT_SECRET environment variable is missing');
    } finally {
        process.env.NODE_ENV = origEnv;
        if (origSecret) process.env.JWT_SECRET = origSecret;
    }
    console.log('Case 15 (Production missing JWT_SECRET throws fatal error):', envSecretThrow ? 'PASS' : 'FAIL');

    // Cleanup
    await User.deleteMany({ email: { $in: ['p7_usera@test.com', 'p7_userb@test.com'] } });
    process.exit(0);
}

runTests().catch(err => {
    console.error('Phase 7 Stage 2 test failed:', err);
    process.exit(1);
});
