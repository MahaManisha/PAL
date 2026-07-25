const mongoose = require('mongoose');
const User = require('./models/User');
const Progress = require('./models/Progress');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const Topic = require('./models/Topic');
const studyPlanService = require('./services/studyPlanService');
const { getStudyPlan } = require('./controllers/studyPlanController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 6 Stage 3 testing...');

    // Fetch existing catalog structure for setup
    const subjects = await Subject.find().lean();
    subjects.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : null;
        const orderB = typeof b.order === 'number' ? b.order : null;
        if (orderA !== null && orderB !== null && orderA !== orderB) return orderA - orderB;
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

    if (orderedCatalogTopics.length < 3) {
        console.error('Test setup error: Database requires at least 3 catalog topics.');
        process.exit(1);
    }

    const t1 = orderedCatalogTopics[0].topic;
    const t2 = orderedCatalogTopics[1].topic;
    const t3 = orderedCatalogTopics[2].topic;

    // CASE 1 - 5, 10, 25, 26, 27, 31-35: New User Plan (0 Progress, max 3 items, 0 DB writes, 0 fake duration/completion fields)
    await User.deleteMany({ email: 'sp_new@test.com' });
    const newUser = await User.create({ name: 'SPNewUser', email: 'sp_new@test.com' });
    const countBefore = await Progress.countDocuments();
    
    const reqNew = { params: { userId: newUser._id.toString() } };
    const resNew = createRes();
    await getStudyPlan(reqNew, resNew);

    const countAfter = await Progress.countDocuments();
    const planNew = resNew.data;

    const isNewPlanOk = resNew.statusCode === 200 &&
        planNew.userId === newUser._id.toString() &&
        Boolean(planNew.generatedAt) &&
        planNew.totalItems === planNew.items.length &&
        planNew.totalItems <= 3 &&
        planNew.items[0].type === 'NEXT_TOPIC' &&
        planNew.items[0].topicId === String(t1._id) &&
        !('estimatedMinutes' in planNew.items[0]) &&
        !('isCompletedToday' in planNew.items[0]) &&
        countBefore === countAfter;

    console.log('Case 1-5, 10, 25-27 & 31-35 (New user plan structure, HTTP 200, 0 DB writes, 0 fake fields):', isNewPlanOk ? 'PASS' : 'FAIL');

    // CASE 11-13 & 20: REMEDIATION stays first with HIGH urgency & conceptTag, no duplicate topicId
    await User.deleteMany({ email: 'sp_remed@test.com' });
    const remedUser = await User.create({ name: 'SPRemedUser', email: 'sp_remed@test.com' });
    await Progress.create({
        userId: remedUser._id,
        topicId: t1._id,
        status: 'fail',
        learningCompleted: true,
        practiceCompleted: true,
        attempts: [{ score: 40, mistakes: [{ conceptTag: 'Matrix Rank Concept' }, { conceptTag: 'Matrix Rank Concept' }] }]
    });

    const resRemed = createRes();
    await getStudyPlan({ params: { userId: remedUser._id.toString() } }, resRemed);
    const planRemed = resRemed.data;

    const topicIdsInPlan = planRemed.items.map(i => i.topicId);
    const hasUniqueTopics = new Set(topicIdsInPlan).size === topicIdsInPlan.length;

    const isRemedPlanOk = planRemed.items[0] &&
        planRemed.items[0].type === 'REMEDIATION' &&
        planRemed.items[0].urgency === 'HIGH' &&
        planRemed.items[0].conceptTag === 'Matrix Rank Concept' &&
        hasUniqueTopics &&
        planRemed.summary.includes('weak');

    console.log('Case 11-13 & 20 (REMEDIATION stays first with HIGH urgency, conceptTag & unique topics):', isRemedPlanOk ? 'PASS' : 'FAIL');

    // CASE 14 - 16: CONTINUE preserves actionTab ('learn', 'practice', 'assessment')
    await User.deleteMany({ email: 'sp_cont@test.com' });
    const contUser = await User.create({ name: 'SPContUser', email: 'sp_cont@test.com' });
    await Progress.create({
        userId: contUser._id,
        topicId: t1._id,
        status: 'in_progress',
        learningCompleted: true,
        practiceCompleted: false
    });

    const resCont = createRes();
    await getStudyPlan({ params: { userId: contUser._id.toString() } }, resCont);
    const planCont = resCont.data;

    const isContOk = planCont.items[0].type === 'CONTINUE' &&
        planCont.items[0].actionTab === 'practice';

    console.log('Case 14-16 (CONTINUE preserves actionTab: practice):', isContOk ? 'PASS' : 'FAIL');

    // CASE 18 & 19: REVIEW preserves isMastered = true and LOW urgency
    await User.deleteMany({ email: 'sp_rev@test.com' });
    const revUser = await User.create({ name: 'SPRevUser', email: 'sp_rev@test.com' });
    await Progress.create({
        userId: revUser._id,
        topicId: t1._id,
        status: 'pass',
        learningCompleted: true,
        practiceCompleted: true,
        attempts: [{ score: 100, mistakes: [{ conceptTag: 'TagX' }, { conceptTag: 'TagX' }] }]
    });
    // Pass t2 and t3 as well so REVIEW becomes the highest available priority
    await Progress.create({ userId: revUser._id, topicId: t2._id, status: 'pass', learningCompleted: true, practiceCompleted: true });
    await Progress.create({ userId: revUser._id, topicId: t3._id, status: 'pass', learningCompleted: true, practiceCompleted: true });

    const resRev = createRes();
    await getStudyPlan({ params: { userId: revUser._id.toString() } }, resRev);
    const planRev = resRev.data;

    const reviewItem = planRev.items.find(i => i.type === 'REVIEW');
    const isRevPlanOk = reviewItem &&
        reviewItem.isMastered === true &&
        reviewItem.urgency === 'LOW' &&
        reviewItem.conceptTag === 'TagX';

    console.log('Case 18 & 19 (REVIEW preserves isMastered=true & LOW urgency):', isRevPlanOk ? 'PASS' : 'FAIL');

    // CASE 28 & 29: Malformed userId (HTTP 400) & Nonexistent user (HTTP 404)
    const res400 = createRes();
    await getStudyPlan({ params: { userId: 'invalid_id' } }, res400);

    const res404 = createRes();
    await getStudyPlan({ params: { userId: new mongoose.Types.ObjectId().toString() } }, res404);

    console.log('Case 28 & 29 (Malformed userId -> 400 & Nonexistent user -> 404):', res400.statusCode === 400 && res404.statusCode === 404 ? 'PASS' : 'FAIL');

    // CASE 36 & 37: Deterministic summary & deterministic output
    const resDet1 = createRes();
    await getStudyPlan({ params: { userId: remedUser._id.toString() } }, resDet1);
    const resDet2 = createRes();
    await getStudyPlan({ params: { userId: remedUser._id.toString() } }, resDet2);

    const isDeterministic = JSON.stringify(resDet1.data.items) === JSON.stringify(resDet2.data.items) &&
        resDet1.data.summary === resDet2.data.summary;
    console.log('Case 36 & 37 (Deterministic plan output and summary for identical DB state):', isDeterministic ? 'PASS' : 'FAIL');

    // Cleanup
    await User.deleteMany({ email: { $in: ['sp_new@test.com', 'sp_remed@test.com', 'sp_cont@test.com', 'sp_rev@test.com'] } });

    process.exit(0);
}

runTests().catch(err => {
    console.error('Phase 6 Stage 3 test run failed:', err);
    process.exit(1);
});
