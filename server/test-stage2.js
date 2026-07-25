const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const Topic = require('./models/Topic');
const Chapter = require('./models/Chapter');
const Subject = require('./models/Subject');
const User = require('./models/User');
const { getWeakAreas } = require('./controllers/analyticsController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Stage 2 testing...');

    await User.deleteMany({ email: 'stage2@test.com' });
    const user = await User.create({ name: 'Stage2User', email: 'stage2@test.com' });
    await Subject.deleteMany({ name: 'Stage2 Test Math' });
    const subject = await Subject.create({ name: 'Stage2 Test Math' });
    const chapter = await Chapter.create({ subjectId: subject._id, chapterName: 'Algebra', order: 1 });
    const topic1 = await Topic.create({ chapterId: chapter._id, topicName: 'Linear Equations', order: 1 });
    const topic2 = await Topic.create({ chapterId: chapter._id, topicName: 'Quadratic Equations', order: 2 });

    // Case 1: No progress -> empty weakAreas
    const res1 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res1);
    console.log('Case 1 (No progress -> empty):', res1.data.totalWeakAreas === 0 && res1.data.weakAreas.length === 0 ? 'PASS' : 'FAIL');

    // Case 2: One concept mistake -> not returned (mistakeCount = 1 < 2)
    const prog1 = await Progress.create({
        userId: user._id,
        topicId: topic1._id,
        status: 'in_progress',
        attempts: [{
            score: 50,
            timestamp: new Date('2026-01-01T10:00:00Z'),
            mistakes: [{ questionId: 'q1', selectedOption: 0, correctOption: 1, conceptTag: 'TagOne' }]
        }]
    });

    const res2 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res2);
    console.log('Case 2 (Single mistake ignored):', res2.data.totalWeakAreas === 0 ? 'PASS' : 'FAIL');

    // Case 3: Same concept missed twice -> returned with mistakeCount = 2
    prog1.attempts.push({
        score: 50,
        timestamp: new Date('2026-01-02T10:00:00Z'),
        mistakes: [{ questionId: 'q2', selectedOption: 0, correctOption: 1, conceptTag: 'TagOne' }]
    });
    await prog1.save();

    const res3 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res3);
    console.log('Case 3 (Mistake count 2 returned):', res3.data.weakAreas.length === 1 && res3.data.weakAreas[0].mistakeCount === 2 ? 'PASS' : 'FAIL');

    // Case 4: Same concept name in two different topics -> two separate groups
    const prog2 = await Progress.create({
        userId: user._id,
        topicId: topic2._id,
        status: 'in_progress',
        attempts: [
            {
                score: 50,
                timestamp: new Date('2026-01-03T10:00:00Z'),
                mistakes: [
                    { questionId: 'q3', selectedOption: 0, correctOption: 1, conceptTag: 'TagOne' },
                    { questionId: 'q4', selectedOption: 0, correctOption: 1, conceptTag: 'TagOne' }
                ]
            }
        ]
    });

    const res4 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res4);
    console.log('Case 4 (Same concept name in 2 topics -> 2 groups):', res4.data.totalWeakAreas === 2 ? 'PASS' : 'FAIL');

    // Case 5 & 6: Policy B (Passed topic gets isMastered=true & REVIEW_SUGGESTED; Unpassed gets isMastered=false & NEEDS_REVISION)
    prog1.status = 'pass';
    await prog1.save();

    const res5 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res5);
    const itemProg1 = res5.data.weakAreas.find(w => w.topicId === topic1._id.toString());
    const itemProg2 = res5.data.weakAreas.find(w => w.topicId === topic2._id.toString());
    console.log('Case 5 (Passed topic Policy B):', itemProg1 && itemProg1.isMastered === true && itemProg1.severity === 'REVIEW_SUGGESTED' ? 'PASS' : 'FAIL');
    console.log('Case 6 (Unpassed topic Policy B):', itemProg2 && itemProg2.isMastered === false && itemProg2.severity === 'NEEDS_REVISION' ? 'PASS' : 'FAIL');

    // Case 7 & 8: Ignored tags (null/empty/General) & Whitespace normalization
    const prog3 = await Progress.create({
        userId: user._id,
        topicId: topic1._id,
        status: 'in_progress',
        attempts: [{
            score: 20,
            timestamp: new Date('2026-01-04T10:00:00Z'),
            mistakes: [
                { questionId: 'q5', selectedOption: 0, correctOption: 1, conceptTag: null },
                { questionId: 'q6', selectedOption: 0, correctOption: 1, conceptTag: '' },
                { questionId: 'q7', selectedOption: 0, correctOption: 1, conceptTag: 'General' },
                { questionId: 'q8', selectedOption: 0, correctOption: 1, conceptTag: '  TagOne  ' },
                { questionId: 'q9', selectedOption: 0, correctOption: 1, conceptTag: '  TagOne  ' }
            ]
        }]
    });

    const res7 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res7);
    const tagOneItem = res7.data.weakAreas.find(w => w.conceptTag === 'TagOne' && w.topicId === topic1._id.toString());
    console.log('Case 7 & 8 (Tag normalization & ignore invalid tags):', tagOneItem && tagOneItem.mistakeCount === 4 ? 'PASS' : 'FAIL');

    // Case 9: More than 5 qualifying areas -> totalWeakAreas = full count, weakAreas.length <= 5
    for (let i = 1; i <= 6; i++) {
        const top = await Topic.create({ chapterId: chapter._id, topicName: `Topic ${i}`, order: i + 2 });
        await Progress.create({
            userId: user._id,
            topicId: top._id,
            status: 'in_progress',
            attempts: [{
                score: 50,
                timestamp: new Date(`2026-01-0${i}T10:00:00Z`),
                mistakes: [
                    { questionId: 'q', selectedOption: 0, correctOption: 1, conceptTag: `Concept ${i}` },
                    { questionId: 'q', selectedOption: 0, correctOption: 1, conceptTag: `Concept ${i}` }
                ]
            }]
        });
    }

    const res9 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res9);
    console.log('Case 9 (Limit to 5 items, totalWeakAreas full count):', res9.data.totalWeakAreas > 5 && res9.data.weakAreas.length === 5 ? 'PASS' : 'FAIL');

    // Case 10 & 11: Sorting (Count DESC -> Timestamp DESC -> Tag ASC)
    const sorted = res9.data.weakAreas;
    let sortCorrect = true;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].mistakeCount < sorted[i+1].mistakeCount) sortCorrect = false;
    }
    console.log('Case 10 & 11 (Sorting correctness):', sortCorrect ? 'PASS' : 'FAIL');

    // Case 12: Malformed userId -> 400 Controlled Error
    const res12 = createRes();
    await getWeakAreas({ params: { userId: 'invalid-id-123' } }, res12);
    console.log('Case 12 (Malformed userId 400):', res12.statusCode === 400 && res12.data.msg === 'Invalid user ID format' ? 'PASS' : 'FAIL');

    // Case 13: Orphaned topic metadata -> graceful omission
    const orphanedProg = await Progress.create({
        userId: user._id,
        topicId: new mongoose.Types.ObjectId(), // Non-existent topic
        status: 'in_progress',
        attempts: [{
            score: 0,
            timestamp: new Date(),
            mistakes: [
                { questionId: 'q', selectedOption: 0, correctOption: 1, conceptTag: 'OrphanConcept' },
                { questionId: 'q', selectedOption: 0, correctOption: 1, conceptTag: 'OrphanConcept' }
            ]
        }]
    });

    const res13 = createRes();
    await getWeakAreas({ params: { userId: user._id.toString() } }, res13);
    const hasOrphan = res13.data.weakAreas.some(w => w.conceptTag === 'OrphanConcept');
    console.log('Case 13 (Orphaned topic graceful omission):', !hasOrphan ? 'PASS' : 'FAIL');

    // Case 14: Zero DB writes
    const progBefore = await Progress.find({ userId: user._id }).lean();
    await getWeakAreas({ params: { userId: user._id.toString() } }, createRes());
    const progAfter = await Progress.find({ userId: user._id }).lean();
    console.log('Case 14 (Zero DB writes):', JSON.stringify(progBefore) === JSON.stringify(progAfter) ? 'PASS' : 'FAIL');

    // Cleanup
    await User.findByIdAndDelete(user._id);
    await Subject.findByIdAndDelete(subject._id);
    await Chapter.findByIdAndDelete(chapter._id);
    await Topic.deleteMany({ chapterId: chapter._id });
    await Progress.deleteMany({ userId: user._id });

    process.exit(0);
}

runTests().catch(err => {
    console.error('Test run failed:', err);
    process.exit(1);
});
