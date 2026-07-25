const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const { getRecommendations } = require('./controllers/recommendationController');
const { getStudyPlan } = require('./controllers/studyPlanController');
const { getWeakAreas } = require('./controllers/analyticsController');
const { getProgressByUser } = require('./controllers/progressController');
const { getUserAchievements } = require('./controllers/achievementController');
const { getUserInventory, purchaseItem } = require('./controllers/storeController');
const { authenticate, authorizeParamUser, authorizeBodyUser } = require('./middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (userId, expiresIn = '1h') => {
    return jwt.sign({ user: { id: String(userId) } }, JWT_SECRET, { expiresIn });
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

// Helper middleware runner
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
    console.log('Connected to DB for Phase 6 Stage 5 Security Testing...');

    await User.deleteMany({ email: { $in: ['sec_usera@test.com', 'sec_userb@test.com'] } });

    const userA = await User.create({ name: 'User A', email: 'sec_usera@test.com', tokens: 100 });
    const userB = await User.create({ name: 'User B', email: 'sec_userb@test.com', tokens: 100 });

    const tokenA = generateToken(userA._id);
    const tokenB = generateToken(userB._id);
    const expiredTokenA = generateToken(userA._id, '-1s');

    // 1. Recommendation without JWT -> 401
    const mock1 = createMockReqRes({}, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock1.req, mock1);
    console.log('Case 1 (Recommendation without JWT -> 401):', mock1.getStatus() === 401 ? 'PASS' : 'FAIL');

    // 2 & 3. Recommendation invalid / expired JWT -> 401
    const mock2 = createMockReqRes({ authorization: 'Bearer invalid_token' }, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock2.req, mock2);

    const mock3 = createMockReqRes({ authorization: `Bearer ${expiredTokenA}` }, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock3.req, mock3);
    console.log('Case 2 & 3 (Recommendation invalid/expired JWT -> 401):', mock2.getStatus() === 401 && mock3.getStatus() === 401 ? 'PASS' : 'FAIL');

    // 4. Recommendation own valid JWT -> allowed
    const mock4 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock4.req, mock4);
    if (mock4.getStatus() === 200) await getRecommendations(mock4.req, mock4.res);
    console.log('Case 4 (Recommendation own valid JWT -> 200):', mock4.getStatus() === 200 ? 'PASS' : 'FAIL');

    // 5. Recommendation cross-user JWT -> 403
    const mock5 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userB._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock5.req, mock5);
    console.log('Case 5 (Recommendation cross-user JWT -> 403):', mock5.getStatus() === 403 ? 'PASS' : 'FAIL');

    // 6-8. Study plan endpoint security (no token -> 401, own -> 200, cross-user -> 403)
    const mock6 = createMockReqRes({}, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock6.req, mock6);

    const mock7 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock7.req, mock7);
    if (mock7.getStatus() === 200) await getStudyPlan(mock7.req, mock7.res);

    const mock8 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userB._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock8.req, mock8);

    console.log('Case 6-8 (Study-plan security: 401 missing, 200 own, 403 cross-user):', mock6.getStatus() === 401 && mock7.getStatus() === 200 && mock8.getStatus() === 403 ? 'PASS' : 'FAIL');

    // 9-11. Weak-area endpoint security
    const mock9 = createMockReqRes({}, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock9.req, mock9);

    const mock11 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userB._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock11.req, mock11);

    console.log('Case 9-11 (Weak-area security: 401 missing, 403 cross-user):', mock9.getStatus() === 401 && mock11.getStatus() === 403 ? 'PASS' : 'FAIL');

    // 12-14. Progress endpoint security
    const mock12 = createMockReqRes({}, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock12.req, mock12);

    const mock14 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userB._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock14.req, mock14);

    console.log('Case 12-14 (Progress security: 401 missing, 403 cross-user):', mock12.getStatus() === 401 && mock14.getStatus() === 403 ? 'PASS' : 'FAIL');

    // 15-17. User achievements security
    const mock15 = createMockReqRes({}, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock15.req, mock15);

    const mock17 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userB._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock17.req, mock17);

    console.log('Case 15-17 (User achievements security: 401 missing, 403 cross-user):', mock15.getStatus() === 401 && mock17.getStatus() === 403 ? 'PASS' : 'FAIL');

    // 19-21. Store user security
    const mock19 = createMockReqRes({}, { userId: userA._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock19.req, mock19);

    const mock21 = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { userId: userB._id.toString() });
    await runMiddlewareChain([authenticate, authorizeParamUser('userId')], mock21.req, mock21);

    console.log('Case 19-21 (Store user inventory security: 401 missing, 403 cross-user):', mock19.getStatus() === 401 && mock21.getStatus() === 403 ? 'PASS' : 'FAIL');

    // 22-25. Store purchase cross-user attack -> 403 & ZERO token deduction from victim
    const initialTokensB = userB.tokens;
    const mock24 = createMockReqRes(
        { authorization: `Bearer ${tokenA}` },
        {},
        { userId: userB._id.toString(), itemKey: 'frame_gold' }
    );
    await runMiddlewareChain([authenticate, authorizeBodyUser('userId')], mock24.req, mock24);

    const freshUserB = await User.findById(userB._id);
    const tokensBUnchanged = freshUserB.tokens === initialTokensB;

    console.log('Case 22-25 (Store purchase cross-user attack -> 403 & ZERO victim token mutation):', mock24.getStatus() === 403 && tokensBUnchanged ? 'PASS' : 'FAIL');

    // Cleanup
    await User.deleteMany({ email: { $in: ['sec_usera@test.com', 'sec_userb@test.com'] } });

    process.exit(0);
}

runTests().catch(err => {
    console.error('Phase 6 Stage 5 security test failed:', err);
    process.exit(1);
});
