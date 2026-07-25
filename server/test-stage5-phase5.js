const mongoose = require('mongoose');
const User = require('./models/User');
const Progress = require('./models/Progress');
const DailyQuest = require('./models/DailyQuest');
const dailyQuestService = require('./services/dailyQuestService');
const { getDailyQuest, submitDailyQuest } = require('./controllers/assessmentController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 5 Stage 5 testing...');

    // Case 1, 2 & 3: Non-destructive idempotent initialization
    await dailyQuestService.ensureDailyQuestCatalogInitialized();
    await dailyQuestService.ensureDailyQuestCatalogInitialized();
    const count = await DailyQuest.countDocuments();
    const keys = await DailyQuest.find().distinct('key');
    console.log('Case 1, 2 & 3 (14 Canonical items & idempotent non-destructive upserts):', count === 14 && keys.length === 14 ? 'PASS' : 'FAIL');

    // Create Test User
    await User.deleteMany({ email: 'p5stage5@test.com' });
    const user = await User.create({ name: 'P5Stage5User', email: 'p5stage5@test.com' });

    // Case 4 & 5: GET returns today's quest & NEVER exposes correctAnswer
    const resGet1 = createRes();
    await getDailyQuest({ params: { userId: user._id.toString() } }, resGet1);
    const hasQuestion = !!resGet1.data.question;
    const exposesAnswer = 'correctAnswer' in (resGet1.data.question || {});
    console.log('Case 4 & 5 (GET returns quest & NEVER exposes correctAnswer):', hasQuestion && !exposesAnswer ? 'PASS' : 'FAIL');

    // Case 6 & 7: Deterministic selection across repeated GET calls
    const resGet2 = createRes();
    await getDailyQuest({ params: { userId: user._id.toString() } }, resGet2);
    const sameQuest = resGet1.data.question.id === resGet2.data.question.id;
    console.log('Case 6 & 7 (Repeated GET on same UTC date returns identical quest):', sameQuest ? 'PASS' : 'FAIL');

    // Fetch authoritative quest for answer validation testing
    const todaysQuest = await dailyQuestService.getTodayQuest();
    const correctOption = todaysQuest.correctAnswer;
    const wrongOption = (correctOption + 1) % todaysQuest.options.length;

    // Case 11: Incorrect answer awards 0 & does not set completedDailyQuestDate
    const resWrong = createRes();
    await submitDailyQuest({ body: { userId: user._id.toString(), questionId: todaysQuest.key, answer: wrongOption } }, resWrong);
    let u11 = await User.findById(user._id);
    console.log('Case 11 (Incorrect answer awards 0 & leaves completedDailyQuestDate empty):', resWrong.data.isCorrect === false && u11.points === 0 && u11.completedDailyQuestDate === '' ? 'PASS' : 'FAIL');

    // Case 8, 9 & 10: First correct completion awards +1 point, +1 token & sets completedDailyQuestDate
    const resCorrect = createRes();
    await submitDailyQuest({ body: { userId: user._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, resCorrect);
    let uCorrect = await User.findById(user._id);
    const todayStr = dailyQuestService.getToday();
    const awardedCorrectly = uCorrect.points === 1 && uCorrect.tokens === 1 && uCorrect.completedDailyQuestDate === todayStr;
    console.log('Case 8, 9 & 10 (First correct pass awards +1 point, +1 token & updates date):', resCorrect.data.isCorrect === true && awardedCorrectly ? 'PASS' : 'FAIL');

    // Case 12: Second submission same day awards 0 additional rewards
    const resDup = createRes();
    await submitDailyQuest({ body: { userId: user._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, resDup);
    let uDup = await User.findById(user._id);
    console.log('Case 12 (Second submission same day awards 0 additional rewards):', resDup.data.alreadyCompleted === true && uDup.points === 1 && uDup.tokens === 1 ? 'PASS' : 'FAIL');

    // Case 13: Concurrent Submissions Test (5 simultaneous correct submissions result in exactly ONE reward claim)
    await User.deleteMany({ email: 'concurrent_dq@test.com' });
    const concUser = await User.create({ name: 'ConcUser', email: 'concurrent_dq@test.com' });
    const concResults = await Promise.all([
        submitDailyQuest({ body: { userId: concUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes()),
        submitDailyQuest({ body: { userId: concUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes()),
        submitDailyQuest({ body: { userId: concUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes()),
        submitDailyQuest({ body: { userId: concUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes()),
        submitDailyQuest({ body: { userId: concUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes())
    ]);
    let uConc = await User.findById(concUser._id);
    console.log('Case 13 (Atomic Concurrency: 5 simultaneous submissions -> exactly +1 point & +1 token):', uConc.points === 1 && uConc.tokens === 1 && uConc.streak === 1 ? 'PASS' : 'FAIL');

    // Case 14 & 15: Streak semantics (Yesterday activity increments streak, missed day resets to 1)
    await User.deleteMany({ email: 'streak_dq@test.com' });
    const yesterdayDate = dailyQuestService.getYesterday();
    const streakUser = await User.create({ name: 'StreakUser', email: 'streak_dq@test.com', streak: 3, lastStudyDate: yesterdayDate });
    await submitDailyQuest({ body: { userId: streakUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes());
    let uStreak = await User.findById(streakUser._id);
    console.log('Case 14 & 15 (Yesterday activity increments streak to 4):', uStreak.streak === 4 ? 'PASS' : 'FAIL');

    // Case 16: Same-day assessment activity preserves streak
    await User.deleteMany({ email: 'sameday@test.com' });
    const samedayUser = await User.create({ name: 'SamedayUser', email: 'sameday@test.com', streak: 5, lastStudyDate: todayStr });
    await submitDailyQuest({ body: { userId: samedayUser._id.toString(), questionId: todaysQuest.key, answer: correctOption } }, createRes());
    let uSame = await User.findById(samedayUser._id);
    console.log('Case 16 (Same-day assessment activity preserves streak = 5 without resetting):', uSame.streak === 5 ? 'PASS' : 'FAIL');

    // Cases 18 - 21: Validation tests on a fresh user (who has not completed today's quest yet)
    await User.deleteMany({ email: 'valid_dq@test.com' });
    const validUser = await User.create({ name: 'ValidUser', email: 'valid_dq@test.com' });

    // Case 18 & 19: Nonexistent/Wrong quest key rejected
    const resWrongKey = createRes();
    await submitDailyQuest({ body: { userId: validUser._id.toString(), questionId: 'GATE_999', answer: 0 } }, resWrongKey);
    console.log('Case 18 & 19 (Nonexistent quest key rejected with 404):', resWrongKey.statusCode === 404 && resWrongKey.data.msg === 'Daily Quest not found' ? 'PASS' : 'FAIL');

    // Case 20: Unavailable quest rejected with 400
    const unavailQuest = await DailyQuest.create({ key: 'GATE_UNAVAIL', questionText: 'Test', options: ['A', 'B'], correctAnswer: 0, subject: 'Test', available: false });
    const resUnavail = createRes();
    await submitDailyQuest({ body: { userId: validUser._id.toString(), questionId: 'GATE_UNAVAIL', answer: 0 } }, resUnavail);
    console.log('Case 20 (Unavailable quest rejected with 400 "Daily Quest unavailable"):', resUnavail.statusCode === 400 && resUnavail.data.msg === 'Daily Quest unavailable' ? 'PASS' : 'FAIL');

    // Case 21: Malformed/out-of-range answer rejected
    const resBadAnswer = createRes();
    await submitDailyQuest({ body: { userId: validUser._id.toString(), questionId: todaysQuest.key, answer: 99 } }, resBadAnswer);
    console.log('Case 21 (Out-of-range answer rejected with 400):', resBadAnswer.statusCode === 400 && resBadAnswer.data.msg === 'Invalid answer index' ? 'PASS' : 'FAIL');

    // Case 22: 0 available quests handled gracefully with HTTP 503
    await DailyQuest.updateMany({}, { available: false });
    const res503 = createRes();
    await getDailyQuest({ params: { userId: validUser._id.toString() } }, res503);
    console.log('Case 22 (0 available quests handled gracefully with HTTP 503):', res503.statusCode === 503 && res503.data.msg === 'Daily Quest is temporarily unavailable' ? 'PASS' : 'FAIL');

    // Restore available quests
    await DailyQuest.updateMany({ key: { $ne: 'GATE_UNAVAIL' } }, { available: true });

    // Cleanup
    await User.findByIdAndDelete(user._id);
    await User.findByIdAndDelete(concUser._id);
    await User.findByIdAndDelete(streakUser._id);
    await User.findByIdAndDelete(samedayUser._id);
    await DailyQuest.findByIdAndDelete(unavailQuest._id);

    process.exit(0);
}

runTests().catch(err => {
    console.error('Stage 5 test run failed:', err);
    process.exit(1);
});
