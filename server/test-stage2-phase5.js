const mongoose = require('mongoose');
const User = require('./models/User');
const Achievement = require('./models/Achievement');
const achievementService = require('./services/achievementService');
const { getAchievementsCatalog, getUserAchievements } = require('./controllers/achievementController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 5 Stage 2 testing...');

    await achievementService.ensureCatalogInitialized();

    // Case 14: Deterministic Catalog Ordering
    const resCatalog = createRes();
    await getAchievementsCatalog({}, resCatalog);
    const catalogKeys = resCatalog.data.map(a => a.key);
    const expectedOrder = ['FIRST_TOPIC', 'TOPIC_MASTER_5', 'STREAK_3', 'STREAK_7', 'PERFECT_SCORE'];
    const isOrderCorrect = JSON.stringify(catalogKeys) === JSON.stringify(expectedOrder);
    console.log('Case 14 (Deterministic Catalog Order):', isOrderCorrect ? 'PASS' : 'FAIL');

    // Case 12: Malformed userId -> HTTP 400
    const resMalformed = createRes();
    await getUserAchievements({ params: { userId: 'invalid-id-123' } }, resMalformed);
    console.log('Case 12 (Malformed userId -> HTTP 400):', resMalformed.statusCode === 400 && resMalformed.data.msg === 'Invalid user ID format' ? 'PASS' : 'FAIL');

    // Case 13: Nonexistent valid ObjectId -> HTTP 404
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res404 = createRes();
    await getUserAchievements({ params: { userId: fakeId } }, res404);
    console.log('Case 13 (Nonexistent userId -> HTTP 404):', res404.statusCode === 404 && res404.data.msg === 'User not found' ? 'PASS' : 'FAIL');

    // Case 15: Valid user returns unlockedBadges array without mutation
    await User.deleteMany({ email: 'stage2api@test.com' });
    const user = await User.create({ name: 'Stage2User', email: 'stage2api@test.com' });
    const resUser = createRes();
    await getUserAchievements({ params: { userId: user._id.toString() } }, resUser);
    console.log('Case 15 (Valid user returns unlockedBadges array safely):', resUser.statusCode === 200 && Array.isArray(resUser.data.unlockedBadges) ? 'PASS' : 'FAIL');

    // Cleanup
    await User.findByIdAndDelete(user._id);

    process.exit(0);
}

runTests().catch(err => {
    console.error('Stage 2 tests failed:', err);
    process.exit(1);
});
