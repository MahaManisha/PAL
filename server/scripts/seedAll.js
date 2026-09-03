const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');
const LearningContent = require('../models/LearningContent');
const DailyQuest = require('../models/DailyQuest');
const StoreItem = require('../models/StoreItem');
const Achievement = require('../models/Achievement');

const { ensureDailyQuestCatalogInitialized } = require('../services/dailyQuestService');
const { ensureStoreCatalogInitialized } = require('../services/storeService');
const { ensureCatalogInitialized: ensureAchievementCatalogInitialized } = require('../services/achievementService');

const seedAll = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        console.log('URI:', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@'));
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas successfully!');

        // 1. Clear existing learning data
        console.log('\n--- 1. Seeding Base Syllabus (Subjects, Chapters, Topics, Assessments & Videos) ---');
        await Subject.deleteMany({});
        await Chapter.deleteMany({});
        await Topic.deleteMany({});
        await Assessment.deleteMany({});
        await LearningContent.deleteMany({});

        const subjects = [
            { name: 'Mathematics' },
            { name: 'Physics' },
            { name: 'Chemistry' }
        ];

        const seededSubjects = {};
        for (let s of subjects) {
            const subject = new Subject(s);
            await subject.save();
            seededSubjects[s.name] = subject._id;
        }
        console.log('Seeded Subjects:', Object.keys(seededSubjects).join(', '));

        const mathId = seededSubjects['Mathematics'];

        // ==========================================
        // Chapter 1: Row Echelon Form
        // ==========================================
        const mathCh1 = new Chapter({
            subjectId: mathId,
            chapterName: 'Chapter 1: Row Echelon Form',
            order: 1
        });
        await mathCh1.save();

        // Chapter 1 Trailer Video & PPT
        await LearningContent.insertMany([
            {
                chapterId: mathCh1._id,
                type: 'TRAILER',
                driveLink: '/videos/Mathematics/Chapter%201/Row%20Echelon%20Form.mp4',
                title: 'Chapter 1 Overview Trailer'
            },
            {
                chapterId: mathCh1._id,
                type: 'MAIN_PPT',
                driveLink: 'https://drive.google.com/embeddedfolderview?id=1P03P4MYFDtCafvditD8QabdBwA3HjVkG#grid',
                title: 'Chapter 1 Main Presentation'
            }
        ]);

        const mathTopic1_1 = new Topic({
            chapterId: mathCh1._id,
            topicName: 'Row Echelon Form',
            order: 1
        });
        await mathTopic1_1.save();

        // Topic 1.1 Micro Video & PPT
        await LearningContent.insertMany([
            {
                chapterId: mathCh1._id,
                topicId: mathTopic1_1._id,
                type: 'MICRO_VIDEO',
                driveLink: '/videos/Mathematics/Chapter%201/Row%20Echelon%20Form.mp4',
                title: 'Row Echelon Form Lecture Video'
            },
            {
                chapterId: mathCh1._id,
                topicId: mathTopic1_1._id,
                type: 'MICRO_PPT',
                driveLink: 'https://drive.google.com/embeddedfolderview?id=1P03P4MYFDtCafvditD8QabdBwA3HjVkG#grid',
                title: 'Row Echelon Form Micro Presentation'
            }
        ]);

        const mathAss1_1 = new Assessment({
            topicId: mathTopic1_1._id,
            questions: [
                {
                    questionText: 'The process of converting a matrix to Row Echelon Form is called:',
                    options: ['Matrix inversion', 'Gaussian Elimination', 'LU Decomposition', 'Gram-Schmidt Process'],
                    correctAnswer: 1,
                    conceptTag: 'Gaussian Elimination'
                },
                {
                    questionText: 'In Row Echelon Form, the first non-zero entry in a non-zero row is called the:',
                    options: ['Pivot or leading 1', 'Determinant', 'Trace', 'Eigenvalue'],
                    correctAnswer: 0,
                    conceptTag: 'Pivot Elements'
                },
                {
                    questionText: 'Which operation is NOT a valid Elementary Row Operation?',
                    options: ['Interchanging two rows', 'Multiplying a row by a non-zero scalar', 'Adding a multiple of one row to another', 'Multiplying two rows together element-wise'],
                    correctAnswer: 3,
                    conceptTag: 'Elementary Row Operations'
                }
            ]
        });
        await mathAss1_1.save();
        console.log('Seeded Chapter 1, Topics, Videos & Assessments.');

        // ==========================================
        // Chapter 2: Complex Numbers
        // ==========================================
        const mathCh2 = new Chapter({
            subjectId: mathId,
            chapterName: 'Chapter 2: Complex Numbers',
            order: 2
        });
        await mathCh2.save();

        // Seed Learning Content for Ch 2 (Trailer & Presentation)
        await LearningContent.insertMany([
            {
                chapterId: mathCh2._id,
                type: 'TRAILER',
                driveLink: '/videos/Mathematics/Chapter%202/Basic%20Algebraic%20Properties.mp4',
                title: 'Chapter 2 Overview Trailer'
            },
            {
                chapterId: mathCh2._id,
                type: 'MAIN_PPT',
                driveLink: 'https://drive.google.com/embeddedfolderview?id=1P03P4MYFDtCafvditD8QabdBwA3HjVkG#grid',
                title: 'Chapter 2 Main Presentation'
            }
        ]);

        // Seed Ch 2 Topics
        const topicsData = [
            { name: '2.1 Introduction to Complex Numbers', order: 1 },
            { name: '2.2 Basic Algebraic Properties', order: 2 },
            { name: '2.3 Conjugate of a Complex Number', order: 3 }
        ];

        for (const tData of topicsData) {
            const topic = new Topic({
                chapterId: mathCh2._id,
                topicName: tData.name,
                order: tData.order
            });
            await topic.save();

            // Seed Topic Micro Video & PPT
            await LearningContent.insertMany([
                {
                    chapterId: mathCh2._id,
                    topicId: topic._id,
                    type: 'MICRO_VIDEO',
                    driveLink: '/videos/Mathematics/Chapter%202/Basic%20Algebraic%20Properties.mp4',
                    title: `${tData.name} Lecture Video`
                },
                {
                    chapterId: mathCh2._id,
                    topicId: topic._id,
                    type: 'MICRO_PPT',
                    driveLink: 'https://drive.google.com/embeddedfolderview?id=1P03P4MYFDtCafvditD8QabdBwA3HjVkG#grid',
                    title: `${tData.name} Presentation`
                }
            ]);

            const topicAss = new Assessment({
                topicId: topic._id,
                type: 'TOPIC',
                passScore: 70,
                questions: [
                    {
                        questionText: `Assessment question for ${tData.name}`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: 0
                    }
                ]
            });
            await topicAss.save();
        }

        // Seed Ch 2 Initial & Final Assessments
        const initialAss = new Assessment({
            chapterId: mathCh2._id,
            type: 'INITIAL',
            passScore: 0,
            questions: [
                { questionText: 'What is the value of i^2?', options: ['1', '-1', 'i', '-i'], correctAnswer: 1, explanation: 'i^2 = -1 by definition.' },
                { questionText: 'If z = a + ib, what is the real part if z is a pure imaginary number?', options: ['a', 'b', '0', '1'], correctAnswer: 2, explanation: 'Pure imaginary means real part a = 0.' },
                { questionText: 'Complex numbers extend real numbers primarily to solve equations with:', options: ['Real solutions', 'No real solutions', 'Rational solutions only', 'Integer solutions only'], correctAnswer: 1, explanation: 'To solve equations like x^2 + 1 = 0.' },
                { questionText: 'For z = 3 + 4i, what is the imaginary part?', options: ['3', '4', '4i', '7'], correctAnswer: 1, explanation: 'The imaginary component is 4.' },
                { questionText: 'Two complex numbers a+ib and c+id are equal iff:', options: ['a=c', 'b=d', 'a=c and b=d', 'a+b=c+d'], correctAnswer: 2, explanation: 'Both real and imaginary parts must match.' }
            ]
        });
        await initialAss.save();

        const finalAss = new Assessment({
            chapterId: mathCh2._id,
            type: 'FINAL',
            passScore: 70,
            questions: [
                { questionText: 'Evaluate (3+4i) + (2-i).', options: ['5+5i', '5+3i', '1+5i', '5-3i'], correctAnswer: 1 },
                { questionText: 'Find the modulus of 3+4i.', options: ['5', '7', '12', '25'], correctAnswer: 0 }
            ]
        });
        await finalAss.save();
        console.log('Seeded Chapter 2 Topics, Videos, Presentations & Assessments.');

        // 2. Catalogs (DailyQuests, StoreItems, Achievements)
        console.log('\n--- 2. Seeding Catalogs (DailyQuests, StoreItems, Achievements) ---');
        await ensureDailyQuestCatalogInitialized();
        console.log('Seeded Daily Quests catalog.');

        await ensureStoreCatalogInitialized();
        console.log('Seeded Store Items catalog.');

        await ensureAchievementCatalogInitialized();
        console.log('Seeded Achievements catalog.');

        console.log('\n======================================================');
        console.log('ALL VIDEOS AND PROJECT DATA SUCCESSFULLY STORED IN MONGO DB ATLAS!');
        console.log('======================================================\n');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedAll();
