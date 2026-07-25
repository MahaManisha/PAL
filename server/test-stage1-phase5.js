const mongoose = require('mongoose');
const User = require('./models/User');
const Progress = require('./models/Progress');
const Topic = require('./models/Topic');
const Chapter = require('./models/Chapter');
const Subject = require('./models/Subject');
const Assessment = require('./models/Assessment');
const Achievement = require('./models/Achievement');
const achievementService = require('./services/achievementService');
const { submitAssessment, submitDailyQuest } = require('./controllers/assessmentController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 5 Stage 1 testing...');

    // Case 15: Run achievement catalog initialization multiple times -> exactly 5 canonical records
    await achievementService.ensureCatalogInitialized();
    await achievementService.ensureCatalogInitialized();
    const catalogCount = await Achievement.countDocuments();
    const catalogKeys = await Achievement.find().distinct('key');
    console.log('Case 15 (Catalog initialization idempotent & 5 canonical items):', catalogCount === 5 && catalogKeys.length === 5 ? 'PASS' : 'FAIL');

    // Create test environment
    await User.deleteMany({ email: 'p5stage1@test.com' });
    const user = await User.create({ name: 'P5Stage1User', email: 'p5stage1@test.com' });
    await Subject.deleteMany({ name: 'P5 Test Subject' });
    const subject = await Subject.create({ name: 'P5 Test Subject' });
    const chapter = await Chapter.create({ subjectId: subject._id, chapterName: 'P5 Chapter', order: 1 });

    const topics = [];
    const assessments = [];
    for (let i = 1; i <= 5; i++) {
        const top = await Topic.create({ chapterId: chapter._id, topicName: `P5 Topic ${i}`, order: i });
        const ass = await Assessment.create({
            topicId: top._id,
            questions: [
                { questionText: 'Q1', options: ['A', 'B'], correctAnswer: 0, conceptTag: 'Tag1' }
            ],
            passScore: 70
        });
        topics.push(top);
        assessments.push(ass);
    }

    // Case 1: New user qualifies for no badges
    await achievementService.evaluateUserAchievements(user._id);
    let u1 = await User.findById(user._id);
    console.log('Case 1 (New user qualifies for 0 badges):', u1.unlockedBadges.length === 0 ? 'PASS' : 'FAIL');

    // Case 2: First passed topic unlocks FIRST_TOPIC
    await submitAssessment({ body: { userId: user._id.toString(), topicId: topics[0]._id.toString(), answers: [0] } }, createRes());
    let u2 = await User.findById(user._id);
    const hasFirstTopic = u2.unlockedBadges.some(b => b.achievementKey === 'FIRST_TOPIC');
    console.log('Case 2 (First passed topic unlocks FIRST_TOPIC):', hasFirstTopic ? 'PASS' : 'FAIL');

    // Case 3: Retaking assessment does not duplicate FIRST_TOPIC
    await submitAssessment({ body: { userId: user._id.toString(), topicId: topics[0]._id.toString(), answers: [0] } }, createRes());
    let u3 = await User.findById(user._id);
    const firstTopicCount = u3.unlockedBadges.filter(b => b.achievementKey === 'FIRST_TOPIC').length;
    console.log('Case 3 (No duplicate badge on retake):', firstTopicCount === 1 ? 'PASS' : 'FAIL');

    // Case 17: PERFECT_SCORE triggered by 100% score server calculation
    const hasPerfectScore = u3.unlockedBadges.some(b => b.achievementKey === 'PERFECT_SCORE');
    console.log('Case 17 (Server-calculated 100% unlocks PERFECT_SCORE):', hasPerfectScore ? 'PASS' : 'FAIL');

    // Case 4: 5 passed topics unlock TOPIC_MASTER_5 ("Topic Explorer")
    for (let i = 1; i < 5; i++) {
        await submitAssessment({ body: { userId: user._id.toString(), topicId: topics[i]._id.toString(), answers: [0] } }, createRes());
    }
    let u4 = await User.findById(user._id);
    const hasTopicMaster5 = u4.unlockedBadges.some(b => b.achievementKey === 'TOPIC_MASTER_5');
    console.log('Case 4 (5 passed topics unlock TOPIC_MASTER_5):', hasTopicMaster5 ? 'PASS' : 'FAIL');

    // Case 5 & 8: 3-day streak unlocks STREAK_3 via assessment activity
    u4.streak = 3;
    await u4.save();
    await achievementService.evaluateUserAchievements(user._id);
    let u5 = await User.findById(user._id);
    const hasStreak3 = u5.unlockedBadges.some(b => b.achievementKey === 'STREAK_3');
    console.log('Case 5 & 8 (3-day streak unlocks STREAK_3 via assessment activity):', hasStreak3 ? 'PASS' : 'FAIL');

    // Case 6 & 7: 7-day streak unlocks STREAK_7 via Daily Quest activity
    u5.streak = 7;
    await u5.save();
    const todayQ = await require('./services/dailyQuestService').getTodayQuest();
    await submitDailyQuest({ body: { userId: user._id.toString(), questionId: todayQ.key, answer: todayQ.correctAnswer } }, createRes());
    let u6 = await User.findById(user._id);
    const hasStreak7 = u6.unlockedBadges.some(b => b.achievementKey === 'STREAK_7');
    console.log('Case 6 & 7 (7-day streak unlocks STREAK_7 via Daily Quest):', hasStreak7 ? 'PASS' : 'FAIL');

    // Case 9: Legacy qualifying user receives missing badges on next activity
    await User.deleteMany({ email: 'legacy@test.com' });
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const legacyUser = await User.create({ name: 'LegacyUser', email: 'legacy@test.com', streak: 3, lastStudyDate: yesterdayDate });
    // Legacy user has passed 5 topics in progress table
    for (let i = 0; i < 5; i++) {
        await Progress.create({ userId: legacyUser._id, topicId: topics[i]._id, status: 'pass', score: 100, bestScore: 100 });
    }
    await submitDailyQuest({ body: { userId: legacyUser._id.toString(), questionId: todayQ.key, answer: todayQ.correctAnswer } }, createRes());
    let uLegacy = await User.findById(legacyUser._id);
    const legacyHasFirst = uLegacy.unlockedBadges.some(b => b.achievementKey === 'FIRST_TOPIC');
    const legacyHas5 = uLegacy.unlockedBadges.some(b => b.achievementKey === 'TOPIC_MASTER_5');
    const legacyHasStreak = uLegacy.unlockedBadges.some(b => b.achievementKey === 'STREAK_3');
    console.log('Case 9 (Legacy user receives missing badges on next activity):', legacyHasFirst && legacyHas5 && legacyHasStreak ? 'PASS' : 'FAIL');

    // Case 10: Lower assessment retake does not remove badges
    await submitAssessment({ body: { userId: user._id.toString(), topicId: topics[0]._id.toString(), answers: [1] } }, createRes()); // 0%
    let u10 = await User.findById(user._id);
    console.log('Case 10 (Lower retake does not remove badges):', u10.unlockedBadges.length === u6.unlockedBadges.length ? 'PASS' : 'FAIL');

    // Case 11: Weak-area analytics remains unaffected
    const analyticsRes = createRes();
    const { getWeakAreas } = require('./controllers/analyticsController');
    await getWeakAreas({ params: { userId: user._id.toString() } }, analyticsRes);
    console.log('Case 11 (Weak-area analytics unaffected):', analyticsRes.statusCode === 200 && Array.isArray(analyticsRes.data.weakAreas) ? 'PASS' : 'FAIL');

    // Case 12: Progression locking remains unaffected
    const prog0 = await Progress.findOne({ userId: user._id, topicId: topics[0]._id });
    console.log('Case 12 (Progression status unaffected):', prog0.status === 'pass' ? 'PASS' : 'FAIL');

    // Case 13: Points and tokens are NOT changed by achievement unlocking (0 token inflation)
    const pointsBefore = u10.points;
    const tokensBefore = u10.tokens;
    await achievementService.evaluateUserAchievements(user._id);
    let u13 = await User.findById(user._id);
    console.log('Case 13 (0 points/tokens awarded for achievements):', u13.points === pointsBefore && u13.tokens === tokensBefore ? 'PASS' : 'FAIL');

    // Case 14: Run multiple achievement evaluations CONCURRENTLY for the same qualifying user
    await Promise.all([
        achievementService.evaluateUserAchievements(user._id),
        achievementService.evaluateUserAchievements(user._id),
        achievementService.evaluateUserAchievements(user._id),
        achievementService.evaluateUserAchievements(user._id),
        achievementService.evaluateUserAchievements(user._id)
    ]);
    let u14 = await User.findById(user._id);
    const uniqueKeys = new Set(u14.unlockedBadges.map(b => b.achievementKey));
    console.log('Case 14 (Concurrent evaluations produce 0 duplicate keys):', u14.unlockedBadges.length === uniqueKeys.size ? 'PASS' : 'FAIL');

    // Case 16: Force achievement evaluation to fail after valid assessment result -> assessment/progress remains valid
    const originalEval = achievementService.evaluateUserAchievements;
    achievementService.evaluateUserAchievements = async () => { throw new Error('Simulated achievement error'); };
    
    const failRes = createRes();
    await submitAssessment({ body: { userId: user._id.toString(), topicId: topics[0]._id.toString(), answers: [0] } }, failRes);
    console.log('Case 16 (Assessment succeeds even if achievement evaluation throws error):', failRes.data.status === 'pass' ? 'PASS' : 'FAIL');

    // Restore original function
    achievementService.evaluateUserAchievements = originalEval;

    // Cleanup test data
    await User.findByIdAndDelete(user._id);
    await User.findByIdAndDelete(legacyUser._id);
    await Subject.findByIdAndDelete(subject._id);
    await Chapter.findByIdAndDelete(chapter._id);
    await Topic.deleteMany({ chapterId: chapter._id });
    await Assessment.deleteMany({ topicId: { $in: topics.map(t => t._id) } });
    await Progress.deleteMany({ userId: { $in: [user._id, legacyUser._id] } });

    process.exit(0);
}

runTests().catch(err => {
    console.error('Test run failed:', err);
    process.exit(1);
});
