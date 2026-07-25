const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Progress = require('./models/Progress');
const Topic = require('./models/Topic');
const Assessment = require('./models/Assessment');

const API_URL = 'http://localhost:5000/api';

async function runSecurityTests() {
    console.log('====================================================');
    console.log('PHASE 8 STAGE 1B — PROGRESS SECURITY TEST SUITE');
    console.log('====================================================\n');

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning');

    // Create 2 test users directly or via API
    const timestamp = Date.now();
    const user1Email = `sec_user1_${timestamp}@test.com`;
    const user2Email = `sec_user2_${timestamp}@test.com`;

    const u1Res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sec User 1', email: user1Email, password: 'password123', interest: 'professional' })
    });
    const u1Data = await u1Res.json();

    const u2Res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sec User 2', email: user2Email, password: 'password123', interest: 'professional' })
    });
    const u2Data = await u2Res.json();

    const user1 = u1Data.user;
    const token1 = u1Data.token;

    const user2 = u2Data.user;
    const token2 = u2Data.token;

    // Fetch a real topic ID from DB
    const topic = await Topic.findOne({}).lean();
    if (!topic) {
        console.error('FATAL: No topic found in database to run tests against.');
        process.exit(1);
    }
    const topicId = String(topic._id);

    console.log(`Test Setup complete. User1 ID: ${user1.id}, User2 ID: ${user2.id}, Topic ID: ${topicId}\n`);

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

    // TEST 1: POST /api/progress/update is no longer available (404)
    const res1 = await fetch(`${API_URL}/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user1.id, topicId, status: 'pass' })
    });
    assertTest('POST /api/progress/update returns 404', res1.status === 404, `Got status ${res1.status}`);

    // TEST 2: Cannot forge status: 'pass' via removed endpoint
    const pBeforeTest2 = await Progress.findOne({ userId: user1.id, topicId }).lean();
    assertTest('Client cannot forge status: "pass"', pBeforeTest2 === null || pBeforeTest2.status !== 'pass');

    // TEST 3: Cannot inject bestScore: 100 via removed endpoint
    assertTest('Client cannot inject bestScore: 100', pBeforeTest2 === null || pBeforeTest2.bestScore !== 100);

    // TEST 4: Database integrity test — Attack payload produces ZERO DB mutation
    const countBeforeAttack = await Progress.countDocuments({ userId: user1.id });
    await fetch(`${API_URL}/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({
            userId: user1.id,
            topicId,
            status: 'pass',
            learningCompleted: true,
            practiceCompleted: true,
            bestScore: 100
        })
    });
    const countAfterAttack = await Progress.countDocuments({ userId: user1.id });
    const recordAfterAttack = await Progress.findOne({ userId: user1.id, topicId }).lean();
    assertTest('Attack payload produces ZERO DB mutation', countBeforeAttack === countAfterAttack && recordAfterAttack === null);

    // TEST 5: POST /api/progress/start works for authenticated owner
    const res5 = await fetch(`${API_URL}/progress/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user1.id, topicId })
    });
    const data5 = await res5.json();
    assertTest('POST /api/progress/start works for owner', res5.status === 200 && data5.status === 'in_progress');

    // TEST 6: POST /api/progress/complete-learning works for authenticated owner
    const res6 = await fetch(`${API_URL}/progress/complete-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user1.id, topicId })
    });
    const data6 = await res6.json();
    assertTest('POST /api/progress/complete-learning works for owner', res6.status === 200 && data6.learningCompleted === true);

    // TEST 7: POST /api/progress/complete-practice works for owner when prerequisites satisfied
    const res7 = await fetch(`${API_URL}/progress/complete-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user1.id, topicId })
    });
    const data7 = await res7.json();
    assertTest('POST /api/progress/complete-practice works for owner', res7.status === 200 && data7.practiceCompleted === true);

    // TEST 8: Cross-user /progress/start returns 403
    const res8 = await fetch(`${API_URL}/progress/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user2.id, topicId })
    });
    assertTest('Cross-user /progress/start returns 403', res8.status === 403);

    // TEST 9: Cross-user /complete-learning returns 403
    const res9 = await fetch(`${API_URL}/progress/complete-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user2.id, topicId })
    });
    assertTest('Cross-user /complete-learning returns 403', res9.status === 403);

    // TEST 10: Cross-user /complete-practice returns 403
    const res10 = await fetch(`${API_URL}/progress/complete-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ userId: user2.id, topicId })
    });
    assertTest('Cross-user /complete-practice returns 403', res10.status === 403);

    // TEST 11: Missing JWT returns 401
    const res11 = await fetch(`${API_URL}/progress/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user1.id, topicId })
    });
    assertTest('Missing JWT returns 401', res11.status === 401);

    // TEST 12: Invalid JWT returns 401
    const res12 = await fetch(`${API_URL}/progress/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid_token_xyz' },
        body: JSON.stringify({ userId: user1.id, topicId })
    });
    assertTest('Invalid JWT returns 401', res12.status === 401);

    // TEST 13: Assessment remains authoritative mechanism for legitimate pass state
    const assessment = await Assessment.findOne({ topicId }).lean();
    if (assessment && assessment.questions && assessment.questions.length > 0) {
        // Submit 100% correct answers via official assessment submission route
        const correctAnswers = assessment.questions.map(q => q.correctAnswer);
        const res13 = await fetch(`${API_URL}/assessment/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
            body: JSON.stringify({ userId: user1.id, topicId, answers: correctAnswers })
        });
        const data13 = await res13.json();

        const pAfterSubmit = await Progress.findOne({ userId: user1.id, topicId }).lean();
        const uAfterSubmit = await User.findById(user1.id).lean();

        assertTest(
            'Assessment produces legitimate pass + awards points',
            data13.status === 'pass' &&
            pAfterSubmit.status === 'pass' &&
            pAfterSubmit.bestScore === 100 &&
            uAfterSubmit.points === 10
        );
    } else {
        console.log('⚠️ Skipping Test 13: No assessment questions found for test topic');
    }

    // Cleanup test users and progress
    await User.deleteMany({ _id: { $in: [user1.id, user2.id] } });
    await Progress.deleteMany({ userId: { $in: [user1.id, user2.id] } });

    await mongoose.disconnect();

    console.log('\n====================================================');
    console.log(`RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedTests === totalTests) {
        console.log('🎉 SECURITY HARDENING VALIDATION SUCCESSFUL!');
        process.exit(0);
    } else {
        console.error('❌ SECURITY HARDENING VALIDATION FAILED!');
        process.exit(1);
    }
}

runSecurityTests().catch(err => {
    console.error('Test script crashed:', err);
    process.exit(1);
});
