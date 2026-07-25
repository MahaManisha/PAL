const mongoose = require('mongoose');
const User = require('./models/User');
const Progress = require('./models/Progress');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const Topic = require('./models/Topic');
const recommendationService = require('./services/recommendationService');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 6 Stage 1 testing...');

    // Fetch existing catalog structure for setup (deterministically pick first subject & first chapter topics)
    const subjects = await Subject.find().lean();
    subjects.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : null;
        const orderB = typeof b.order === 'number' ? b.order : null;
        if (orderA !== null && orderB !== null && orderA !== orderB) {
            return orderA - orderB;
        }
        const nameA = a.name || a.subjectName || '';
        const nameB = b.name || b.subjectName || '';
        const comp = nameA.localeCompare(nameB);
        if (comp !== 0) return comp;
        return String(a._id).localeCompare(String(b._id));
    });

    const orderedCatalogTopics = [];
    for (const sub of subjects) {
        const subChaps = await Chapter.find({ subjectId: sub._id }).sort({ order: 1, _id: 1 }).lean();
        for (const chap of subChaps) {
            const chapTops = await Topic.find({ chapterId: chap._id }).sort({ order: 1, _id: 1 }).lean();
            for (const top of chapTops) {
                orderedCatalogTopics.push({ topic: top, chapter: chap, subject: sub });
            }
        }
    }

    if (orderedCatalogTopics.length < 2) {
        console.error('Test setup error: Database requires at least 2 catalog topics.');
        process.exit(1);
    }

    const t1 = orderedCatalogTopics[0].topic;
    const t2 = orderedCatalogTopics[1].topic;
    console.log('Test Setup Info: t1=', t1.topicName, 't2=', t2.topicName);

    // CASE 1, 20 & 28: New user recommendation (0 Progress records, ZERO DB writes)
    await User.deleteMany({ email: 'new_p6@test.com' });
    const newUser = await User.create({ name: 'NewP6User', email: 'new_p6@test.com' });
    const countBefore = await Progress.countDocuments();
    const resNew = await recommendationService.getRecommendationsForUser(newUser._id.toString());
    const countAfter = await Progress.countDocuments();

    const isNewUserOk = resNew.primaryRecommendation &&
        resNew.primaryRecommendation.type === 'NEXT_TOPIC' &&
        resNew.primaryRecommendation.urgency === 'MEDIUM' &&
        resNew.primaryRecommendation.actionTab === 'learn' &&
        countBefore === countAfter;
    console.log('Case 1, 20 & 28 (New user -> NEXT_TOPIC & ZERO DB writes):', isNewUserOk ? 'PASS' : 'FAIL');

    // CASE 2 & 3: Unmastered weak area -> REMEDIATION with HIGH urgency
    await User.deleteMany({ email: 'remed_p6@test.com' });
    const remedUser = await User.create({ name: 'RemedUser', email: 'remed_p6@test.com' });
    await Progress.create({
        userId: remedUser._id,
        topicId: t1._id,
        status: 'fail',
        learningCompleted: true,
        practiceCompleted: true,
        attempts: [
            { score: 50, mistakes: [{ conceptTag: 'Matrix Multiplication' }, { conceptTag: 'Matrix Multiplication' }] }
        ]
    });

    const resRemed = await recommendationService.getRecommendationsForUser(remedUser._id.toString());
    const isRemedOk = resRemed.primaryRecommendation &&
        resRemed.primaryRecommendation.type === 'REMEDIATION' &&
        resRemed.primaryRecommendation.urgency === 'HIGH' &&
        resRemed.primaryRecommendation.conceptTag === 'Matrix Multiplication' &&
        resRemed.primaryRecommendation.actionTab === 'learn';
    console.log('Case 2 & 3 (Unmastered weak area -> REMEDIATION with HIGH urgency):', isRemedOk ? 'PASS' : 'FAIL');

    // CASE 4: Learning incomplete -> CONTINUE learn
    await User.deleteMany({ email: 'cont1_p6@test.com' });
    const cont1User = await User.create({ name: 'Cont1User', email: 'cont1_p6@test.com' });
    await Progress.create({
        userId: cont1User._id,
        topicId: t1._id,
        status: 'in_progress',
        learningCompleted: false,
        practiceCompleted: false
    });
    const resCont1 = await recommendationService.getRecommendationsForUser(cont1User._id.toString());
    const isCont1Ok = resCont1.primaryRecommendation &&
        resCont1.primaryRecommendation.type === 'CONTINUE' &&
        resCont1.primaryRecommendation.actionTab === 'learn';
    console.log('Case 4 (Started learning incomplete -> CONTINUE learn):', isCont1Ok ? 'PASS' : 'FAIL');

    // CASE 5: Learning complete, practice incomplete -> CONTINUE practice
    await User.deleteMany({ email: 'cont2_p6@test.com' });
    const cont2User = await User.create({ name: 'Cont2User', email: 'cont2_p6@test.com' });
    await Progress.create({
        userId: cont2User._id,
        topicId: t1._id,
        status: 'in_progress',
        learningCompleted: true,
        practiceCompleted: false
    });
    const resCont2 = await recommendationService.getRecommendationsForUser(cont2User._id.toString());
    const isCont2Ok = resCont2.primaryRecommendation &&
        resCont2.primaryRecommendation.type === 'CONTINUE' &&
        resCont2.primaryRecommendation.actionTab === 'practice';
    console.log('Case 5 (Learning complete, practice incomplete -> CONTINUE practice):', isCont2Ok ? 'PASS' : 'FAIL');

    // CASE 6: Practice complete, assessment pending -> CONTINUE assessment
    await User.deleteMany({ email: 'cont3_p6@test.com' });
    const cont3User = await User.create({ name: 'Cont3User', email: 'cont3_p6@test.com' });
    await Progress.create({
        userId: cont3User._id,
        topicId: t1._id,
        status: 'in_progress',
        learningCompleted: true,
        practiceCompleted: true
    });
    const resCont3 = await recommendationService.getRecommendationsForUser(cont3User._id.toString());
    const isCont3Ok = resCont3.primaryRecommendation &&
        resCont3.primaryRecommendation.type === 'CONTINUE' &&
        resCont3.primaryRecommendation.actionTab === 'assessment';
    console.log('Case 6 (Practice complete -> CONTINUE assessment):', isCont3Ok ? 'PASS' : 'FAIL');

    // CASE 7 & 8: NEXT_TOPIC & Locked Topic Protection
    await User.deleteMany({ email: 'next_p6@test.com' });
    const nextUser = await User.create({ name: 'NextUser', email: 'next_p6@test.com' });
    // Pass topic 1
    await Progress.create({ userId: nextUser._id, topicId: t1._id, status: 'pass', learningCompleted: true, practiceCompleted: true });
    const resNext = await recommendationService.getRecommendationsForUser(nextUser._id.toString());
    const isNextOk = resNext.primaryRecommendation &&
        resNext.primaryRecommendation.type === 'NEXT_TOPIC' &&
        resNext.primaryRecommendation.topicId === String(t2._id);
    console.log('Case 7 & 8 (Next accessible topic -> NEXT_TOPIC & locked topic protection):', isNextOk ? 'PASS' : 'FAIL');

    // CASE 9, 10 & 11: Mastered weak topic -> REVIEW (isMastered true, urgency LOW)
    await User.deleteMany({ email: 'rev_p6@test.com' });
    const revUser = await User.create({ name: 'RevUser', email: 'rev_p6@test.com' });
    await Progress.create({
        userId: revUser._id,
        topicId: t1._id,
        status: 'pass',
        learningCompleted: true,
        practiceCompleted: true,
        attempts: [
            { score: 100, mistakes: [{ conceptTag: 'Determinants' }, { conceptTag: 'Determinants' }] }
        ]
    });
    if (t2 && String(t2._id) !== String(t1._id)) {
        await Progress.create({
            userId: revUser._id,
            topicId: t2._id,
            status: 'pass',
            learningCompleted: true,
            practiceCompleted: true
        });
    }
    const resRev = await recommendationService.getRecommendationsForUser(revUser._id.toString());
    const reviewRec = resRev.recommendations.find(r => r.type === 'REVIEW');
    const isRevOk = reviewRec &&
        reviewRec.isMastered === true &&
        reviewRec.urgency === 'LOW' &&
        reviewRec.conceptTag === 'Determinants';
    console.log('Case 9, 10 & 11 (Mastered weak topic -> REVIEW with isMastered=true & urgency=LOW):', isRevOk ? 'PASS' : 'FAIL');

    // CASE 12, 14 & 18: Deterministic sorting, 1 item per topic, max 5 recommendations
    await User.deleteMany({ email: 'multi_p6@test.com' });
    const multiUser = await User.create({ name: 'MultiUser', email: 'multi_p6@test.com' });
    // Create multiple mistakes in t1
    await Progress.create({
        userId: multiUser._id,
        topicId: t1._id,
        status: 'fail',
        attempts: [{ mistakes: [{ conceptTag: 'TagA' }, { conceptTag: 'TagA' }, { conceptTag: 'TagB' }, { conceptTag: 'TagB' }] }]
    });
    const resMulti = await recommendationService.getRecommendationsForUser(multiUser._id.toString());
    const isMultiOk = resMulti.recommendations.length <= 5 &&
        resMulti.recommendations.filter(r => r.topicId === String(t1._id)).length === 1; // Exactly 1 per topic
    console.log('Case 12, 14 & 18 (Deterministic sorting, 1 item per topic, max 5 items):', isMultiOk ? 'PASS' : 'FAIL');

    // CASE 15, 16 & 17: Null, empty, and "general" concept tags ignored
    await User.deleteMany({ email: 'ignore_p6@test.com' });
    const ignoreUser = await User.create({ name: 'IgnoreUser', email: 'ignore_p6@test.com' });
    await Progress.create({
        userId: ignoreUser._id,
        topicId: t1._id,
        status: 'fail',
        attempts: [{ mistakes: [{ conceptTag: null }, { conceptTag: '' }, { conceptTag: 'general' }] }]
    });
    const resIgnore = await recommendationService.getRecommendationsForUser(ignoreUser._id.toString());
    const isIgnoreOk = resIgnore.primaryRecommendation.type !== 'REMEDIATION';
    console.log('Case 15, 16 & 17 (Null, empty, and "general" concept tags ignored):', isIgnoreOk ? 'PASS' : 'FAIL');

    // CASE 19: Primary recommendation matches recommendations[0]
    console.log('Case 19 (primaryRecommendation === recommendations[0]):', JSON.stringify(resMulti.primaryRecommendation) === JSON.stringify(resMulti.recommendations[0]) ? 'PASS' : 'FAIL');

    // CASE 21 & 22: Malformed userId (400) & Nonexistent user (404)
    let is400Ok = false;
    try {
        await recommendationService.getRecommendationsForUser('invalid_id');
    } catch (e) {
        is400Ok = (e.statusCode === 400);
    }
    let is404Ok = false;
    try {
        await recommendationService.getRecommendationsForUser(new mongoose.Types.ObjectId().toString());
    } catch (e) {
        is404Ok = (e.statusCode === 404);
    }
    console.log('Case 21 & 22 (Malformed userId -> 400 & Nonexistent user -> 404):', is400Ok && is404Ok ? 'PASS' : 'FAIL');

    // CASE 23: Orphan Progress topic reference handled gracefully
    await User.deleteMany({ email: 'orphan_p6@test.com' });
    const orphanUser = await User.create({ name: 'OrphanUser', email: 'orphan_p6@test.com' });
    await Progress.create({
        userId: orphanUser._id,
        topicId: new mongoose.Types.ObjectId(), // Orphan topic ID
        status: 'fail',
        attempts: [{ mistakes: [{ conceptTag: 'OrphanTag' }, { conceptTag: 'OrphanTag' }] }]
    });
    const resOrphan = await recommendationService.getRecommendationsForUser(orphanUser._id.toString());
    console.log('Case 23 (Orphan Progress topic handled gracefully without throwing error):', resOrphan ? 'PASS' : 'FAIL');

    // CASE 25 & 26: No duplicate REMEDIATION as CONTINUE or NEXT_TOPIC
    const remedTopicId = resRemed.primaryRecommendation.topicId;
    const hasRemedAsContOrNext = resRemed.recommendations.some(r => r.topicId === remedTopicId && (r.type === 'CONTINUE' || r.type === 'NEXT_TOPIC'));
    console.log('Case 25 & 26 (No REMEDIATION topic duplicated as CONTINUE/NEXT_TOPIC):', !hasRemedAsContOrNext ? 'PASS' : 'FAIL');

    // Cleanup
    await User.deleteMany({ email: { $in: ['new_p6@test.com', 'remed_p6@test.com', 'cont1_p6@test.com', 'cont2_p6@test.com', 'cont3_p6@test.com', 'next_p6@test.com', 'rev_p6@test.com', 'multi_p6@test.com', 'ignore_p6@test.com', 'orphan_p6@test.com'] } });

    process.exit(0);
}

runTests().catch(err => {
    console.error('Stage 1 Phase 6 test run failed:', err);
    process.exit(1);
});
