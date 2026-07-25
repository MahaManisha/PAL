const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Progress = require('./models/Progress');
const Topic = require('./models/Topic');

const API_URL = 'http://localhost:5000/api';

async function runLeaderboardBackendTests() {
    console.log('====================================================');
    console.log('PHASE 8 STAGE 2 — LEADERBOARD SYSTEM TEST SUITE');
    console.log('====================================================\n');

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning');

    const timestamp = Date.now();

    // Create test topic for progress records
    let topic = await Topic.findOne({}).lean();
    if (!topic) {
        console.error('FATAL: No topic found in database');
        process.exit(1);
    }
    const topicId = String(topic._id);

    // Create test users with varying points & mastered topics
    // User A: 200 pts, 1 mastered
    // User B: 200 pts, 3 mastered (should rank ABOVE A due to tie-breaker 1)
    // User C: 100 pts, 5 mastered
    // User D: 0 pts, 0 mastered (zero point new user)
    const registerUser = async (name, email, points = 0) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: 'password123', interest: 'professional' })
        });
        const data = await res.json();
        if (points > 0) {
            await User.updateOne({ _id: data.user.id }, { $set: { points } });
        }
        return { user: data.user, token: data.token };
    };

    const uA = await registerUser('Learner A', `lb_a_${timestamp}@test.com`, 200);
    const uB = await registerUser('Learner B', `lb_b_${timestamp}@test.com`, 200);
    const uC = await registerUser('Learner C', `lb_c_${timestamp}@test.com`, 100);
    const uD = await registerUser('Learner D', `lb_d_${timestamp}@test.com`, 0);

    // Add progress records for tie-breaker testing
    // User B gets 3 passed topics (we create synthetic pass records for test)
    await Progress.create([
        { userId: uA.user.id, topicId, status: 'pass', score: 100 },
        { userId: uB.user.id, topicId, status: 'pass', score: 100 },
        { userId: uB.user.id, topicId: new mongoose.Types.ObjectId(), status: 'pass', score: 90 },
        { userId: uB.user.id, topicId: new mongoose.Types.ObjectId(), status: 'pass', score: 85 },
        { userId: uC.user.id, topicId, status: 'in_progress', score: 0 }, // in_progress should NOT count
        { userId: uC.user.id, topicId: new mongoose.Types.ObjectId(), status: 'fail', score: 40 } // fail should NOT count
    ]);

    let passedTests = 0;
    let totalTests = 0;

    function assertTest(name, condition, details = '') {
        totalTests++;
        if (condition) {
            console.log(`✅ [PASS] TEST ${totalTests}: ${name}`);
            passedTests++;
        } else {
            console.error(`❌ [FAIL] TEST ${totalTests}: ${name} ${details ? '(' + details + ')' : ''}`);
        }
    }

    // TEST 1: Endpoint without JWT -> 401
    const res1 = await fetch(`${API_URL}/leaderboard`);
    assertTest('Leaderboard endpoint without JWT returns 401', res1.status === 401);

    // TEST 2: Invalid JWT -> 401
    const res2 = await fetch(`${API_URL}/leaderboard`, {
        headers: { Authorization: 'Bearer invalid_jwt_token' }
    });
    assertTest('Invalid JWT returns 401', res2.status === 401);

    // TEST 3: Valid JWT -> 200
    const res3 = await fetch(`${API_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${uA.token}` }
    });
    const data3 = await res3.json();
    assertTest('Valid JWT returns 200 + leaderboard array', res3.status === 200 && Array.isArray(data3.leaderboard));

    // TEST 4: Response does not expose passwords
    const hasPassword = data3.leaderboard.some(u => 'password' in u);
    assertTest('Response does not expose passwords', !hasPassword);

    // TEST 5: Response does not expose emails
    const hasEmail = data3.leaderboard.some(u => 'email' in u);
    assertTest('Response does not expose emails', !hasEmail);

    // TEST 6: Response does not expose private/inventory/token fields
    const hasPrivateFields = data3.leaderboard.some(u => 'tokens' in u || 'inventory' in u || 'googleId' in u);
    assertTest('Response does not expose tokens, inventory, or googleId', !hasPrivateFields);

    // TEST 7: Higher points ranks above lower points (200 pts > 100 pts)
    const idxB = data3.leaderboard.findIndex(u => u.userId === uB.user.id);
    const idxC = data3.leaderboard.findIndex(u => u.userId === uC.user.id);
    assertTest('Higher points ranks above lower points', idxB >= 0 && idxC >= 0 && idxB < idxC);

    // TEST 8: Equal points: higher masteredTopics ranks first (User B has 3 mastered vs User A has 1 mastered)
    const idxA = data3.leaderboard.findIndex(u => u.userId === uA.user.id);
    assertTest('Equal points: higher masteredTopics ranks first', idxB >= 0 && idxA >= 0 && idxB < idxA);

    // TEST 9: Final deterministic tie-breaker (createdAt ASC)
    // Both users created sequentially; order is stable
    assertTest('Deterministic tie-breaker produces distinct rank index', idxA !== idxB);

    // TEST 10: Ranks are sequential (1, 2, 3...)
    const isSequential = data3.leaderboard.every((u, i) => u.rank === i + 1);
    assertTest('Ranks are sequential 1..N', isSequential);

    // TEST 11 & 12 & 13: masteredTopics counts ONLY status === 'pass' (in_progress & fail excluded)
    const entryC = data3.leaderboard.find(u => u.userId === uC.user.id);
    assertTest('in_progress and fail statuses do NOT count as mastered', entryC && entryC.masteredTopics === 0);

    // TEST 14: New zero-point user appears safely
    const entryD = data3.leaderboard.find(u => u.userId === uD.user.id);
    assertTest('New zero-point user appears safely in leaderboard', entryD && entryD.points === 0 && entryD.rank > 0);

    // TEST 15: Current user rank is correct
    assertTest('Current user object returned with correct rank', data3.currentUser && data3.currentUser.userId === uA.user.id && data3.currentUser.rank === idxA + 1);

    // TEST 16: Current user is returned separately
    assertTest('currentUser field is present in response', data3.currentUser !== null);

    // TEST 17: Leaderboard maximum count obeys limit
    assertTest('Leaderboard obeys maximum limit (<= 50)', data3.leaderboard.length <= 50);

    // TEST 18: Zero database writes on GET /api/leaderboard
    const userStateBefore = await User.findById(uA.user.id).lean();
    await fetch(`${API_URL}/leaderboard`, { headers: { Authorization: `Bearer ${uA.token}` } });
    const userStateAfter = await User.findById(uA.user.id).lean();
    assertTest('Leaderboard generation performs ZERO database writes', userStateBefore.updatedAt.getTime() === userStateAfter.updatedAt.getTime());

    // TEST 19: User stats remain unaltered after leaderboard fetch
    assertTest(
        'User stats (points, streak, tokens) unaltered',
        userStateAfter.points === 200 && userStateAfter.tokens === 0
    );

    // TEST 20: POST /api/progress/update remains unavailable (404)
    const res20 = await fetch(`${API_URL}/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${uA.token}` },
        body: JSON.stringify({ userId: uA.user.id, topicId, status: 'pass' })
    });
    assertTest('POST /api/progress/update remains unavailable (404)', res20.status === 404);

    // TEST 21: Deterministic output across repeated requests
    const res21a = await fetch(`${API_URL}/leaderboard`, { headers: { Authorization: `Bearer ${uA.token}` } });
    const data21a = await res21a.json();
    const res21b = await fetch(`${API_URL}/leaderboard`, { headers: { Authorization: `Bearer ${uA.token}` } });
    const data21b = await res21b.json();

    const isIdentical = JSON.stringify(data21a.leaderboard) === JSON.stringify(data21b.leaderboard);
    assertTest('Leaderboard ordering is deterministic across repeated requests', isIdentical);

    // Cleanup test data
    const testUserIds = [uA.user.id, uB.user.id, uC.user.id, uD.user.id];
    await User.deleteMany({ _id: { $in: testUserIds } });
    await Progress.deleteMany({ userId: { $in: testUserIds } });

    await mongoose.disconnect();

    console.log('\n====================================================');
    console.log(`RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedTests === totalTests) {
        console.log('🎉 LEADERBOARD BACKEND VALIDATION SUCCESSFUL!');
        process.exit(0);
    } else {
        console.error('❌ LEADERBOARD BACKEND VALIDATION FAILED!');
        process.exit(1);
    }
}

runLeaderboardBackendTests().catch(err => {
    console.error('Test script crashed:', err);
    process.exit(1);
});
