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
            { name: '2.2 Geometry and Locus of Complex Numbers', order: 2 },
            { name: '2.3 Basic Algebraic Properties of Complex Numbers', order: 3 },
            { name: '2.4 Conjugate of a Complex Number', order: 4 }
        ];

        for (const tData of topicsData) {
            const topic = new Topic({
                chapterId: mathCh2._id,
                topicName: tData.name,
                order: tData.order
            });
            await topic.save();

            const pptLinks = {
                1: '/videos/Mathematics/Chapter%202/Micro_Content_Hub/2.1/2.1_Introduction_to_Complex_Numbers%20.pptx',
                2: '/videos/Mathematics/Chapter%202/Micro_Content_Hub/2.2/2.2_micro_content_complex_circle_locus.pptx',
                3: '/videos/Mathematics/Chapter%202/Micro_Content_Hub/2.3_Algebraic_Properties_of_Complex_Numbers.pptx',
                4: '/videos/Mathematics/Chapter%202/Micro_Content_Hub/2.4_Conjugate_of_Complex_Number_MicroContent-2.pptx'
            };

            // Seed Topic Micro Video & PPT
            await LearningContent.insertMany([
                {
                    chapterId: mathCh2._id,
                    topicId: topic._id,
                    type: 'MICRO_VIDEO',
                    driveLink: '/videos/Mathematics/Chapter%202/02_ComplexNumbers_Video.mp4',
                    title: `${tData.name} Lecture Video`
                },
                {
                    chapterId: mathCh2._id,
                    topicId: topic._id,
                    type: 'MICRO_PPT',
                    driveLink: pptLinks[tData.order] || '/videos/Mathematics/Chapter%202/Micro_Content_Hub/2.1/2.1_Introduction_to_Complex_Numbers%20.pptx',
                    title: `${tData.name} Presentation`
                }
            ]);

            const ex2_2_questions = [
                { questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of z + w?', options: ['1 + 7i', '1 – 7i', '–1 + 7i', '3 – i'], correctAnswer: 0, explanation: 'z + w = (2 + (-1)) + (3 + 4)i = 1 + 7i.' },
                { questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of z – iw?', options: ['6 + 4i', '6 – 4i', '–6 + 4i', '–2 + 2i'], correctAnswer: 0, explanation: 'z - iw = (2 + 3i) - i(-1 + 4i) = 2 + 3i + i + 4 = 6 + 4i.' },
                { questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of 2z + 3w?', options: ['1 + 18i', '–1 + 18i', '7 + 2i', '1 – 18i'], correctAnswer: 0, explanation: '2z + 3w = 2(2 + 3i) + 3(-1 + 4i) = (4 - 3) + (6 + 12)i = 1 + 18i.' },
                { questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of zw?', options: ['–14 + 5i', '14 + 5i', '–14 – 5i', '2 + 5i'], correctAnswer: 0, explanation: 'zw = (2 + 3i)(-1 + 4i) = -2 + 8i - 3i - 12 = -14 + 5i.' },
                { questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of (z + w)²?', options: ['–48 + 14i', '48 + 14i', '–48 – 14i', '14 – 48i'], correctAnswer: 0, explanation: 'z + w = 1 + 7i. (1 + 7i)² = 1 + 14i - 49 = -48 + 14i.' },
                { questionText: 'If z₁ = 6 + 7i and z₂ = 3 – 5i, what is the value of z₁ – z₂?', options: ['3 + 12i', '3 – 12i', '–3 + 12i', '9 + 2i'], correctAnswer: 0, explanation: 'z1 - z2 = (6 - 3) + (7 - (-5))i = 3 + 12i.' },
                { questionText: 'If z = 2 + 3i, what is iz, the image of z after a 90° rotation about the origin?', options: ['–3 + 2i', '3 + 2i', '–3 – 2i', '3 – 2i'], correctAnswer: 0, explanation: 'iz = i(2 + 3i) = 2i + 3i² = -3 + 2i.' },
                { questionText: 'If z = 2 + 3i, what is the value of z + iz?', options: ['–1 + 5i', '1 + 5i', '–1 – 5i', '5 – i'], correctAnswer: 0, explanation: 'z + iz = (2 + 3i) + (-3 + 2i) = -1 + 5i.' },
                { questionText: 'If x and y are real numbers such that (x + iy) + (1 – 2i) = 4 + 3i, what is the value of x + y?', options: ['8', '–8', '2', '15'], correctAnswer: 0, explanation: '(x + 1) + i(y - 2) = 4 + 3i => x = 3, y = 5 => x + y = 8.' },
                { questionText: 'If real numbers x and y satisfy 2x + 3iy = 6 – 9i, what is the value of x – y?', options: ['6', '0', '–6', '3'], correctAnswer: 0, explanation: '2x = 6 => x = 3; 3y = -9 => y = -3 => x - y = 3 - (-3) = 6.' }
            ];

            const ex2_3_questions = [
                { questionText: 'For any two complex numbers z₁ and z₂, the equation z₁ + z₂ = z₂ + z₁ illustrates which property?', options: ['Commutative property', 'Associative property', 'Closure property', 'Distributive property'], correctAnswer: 0, explanation: 'z1 + z2 = z2 + z1 represents the Commutative property of addition.' },
                { questionText: 'For any three complex numbers z₁, z₂, z₃, the equation (z₁ + z₂) + z₃ = z₁ + (z₂ + z₃) illustrates which property?', options: ['Closure property', 'Commutative property', 'Associative property', 'Distributive property'], correctAnswer: 2, explanation: '(z1 + z2) + z3 = z1 + (z2 + z3) represents the Associative property of addition.' },
                { questionText: 'If z₁ = 1 – 3i, z₂ = –4i and z₃ = 5, what is the value of (z₁ + z₂) + z₃?', options: ['6 – 7i', '–6 + 7i', '6 + 7i', '–4 – 7i'], correctAnswer: 0, explanation: '(1 - 3i - 4i) + 5 = (1 - 7i) + 5 = 6 - 7i.' },
                { questionText: 'If z₁ = 1 – 3i, z₂ = –4i and z₃ = 5, what is the value of z₁(z₂ + z₃)?', options: ['–7 – 19i', '7 + 19i', '–7 + 19i', '–19 – 7i'], correctAnswer: 0, explanation: 'z2 + z3 = 5 - 4i. z1(z2 + z3) = (1 - 3i)(5 - 4i) = 5 - 4i - 15i - 12 = -7 - 19i.' },
                { questionText: 'If z₁ = 3, z₂ = –7i and z₃ = 5 + 4i, what is the value of z₁z₂ + z₁z₃ (by the distributive property)?', options: ['15 – 9i', '–15 + 9i', '15 + 9i', '9 – 15i'], correctAnswer: 0, explanation: 'z1(z2 + z3) = 3(-7i + 5 + 4i) = 3(5 - 3i) = 15 - 9i.' },
                { questionText: 'What is the multiplicative inverse of a nonzero complex number z = x + iy?', options: ['x/(x² + y²) + iy/(x² + y²)', '(x² + y²)/x – iy', 'x/(x² + y²) – iy/(x² + y²)', '–x/(x² + y²) + iy/(x² + y²)'], correctAnswer: 2, explanation: '1/(x + iy) = (x - iy)/(x² + y²) = x/(x² + y²) - iy/(x² + y²).' },
                { questionText: 'If z₁ = 2 + 5i, what is the additive inverse of z₁?', options: ['–2 – 5i', '2 – 5i', '–2 + 5i', '5 + 2i'], correctAnswer: 0, explanation: '-z1 = -(2 + 5i) = -2 - 5i.' },
                { questionText: 'If z₁ = 2 + 5i, what is the multiplicative inverse of z₁?', options: ['2/29 – 5i/29', '2/29 + 5i/29', '–2/29 – 5i/29', '5/29 – 2i/29'], correctAnswer: 0, explanation: '1/(2 + 5i) = (2 - 5i)/(4 + 25) = 2/29 - 5i/29.' },
                { questionText: 'The conjugate of the complex number z = x + iy is defined as:', options: ['x – iy', '–x + iy', 'x + iy', '–x – iy'], correctAnswer: 0, explanation: 'The conjugate of z = x + iy is z_bar = x - iy.' },
                { questionText: 'If z = 4 + 7i, what is the value of z plus its conjugate (z + conjugate of z)?', options: ['8', '14i', '8 + 14i', '0'], correctAnswer: 0, explanation: 'z + z_bar = (4 + 7i) + (4 - 7i) = 8.' }
            ];

            const ex2_4_questions = [
                { questionText: 'Find the real part of (3 + 4i) / (5 – 12i).', options: ['33/169', '–33/169', '56/169', '–56/169'], correctAnswer: 1, explanation: '(3 + 4i)(5 + 12i) / 169 = (-33 + 56i) / 169. Real part is -33/169.' },
                { questionText: 'If z = 2 + 3i, find z⁻¹ in rectangular form.', options: ['(2/13) – (3/13)i', '(2/5) – (3/5)i', '(2/13) + (3/13)i', '2 – 3i'], correctAnswer: 0, explanation: '1/(2 + 3i) = (2 - 3i)/13 = (2/13) - (3/13)i.' },
                { questionText: 'Evaluate (1 + i) / (1 – i).', options: ['1', 'i', '–i', '0'], correctAnswer: 1, explanation: '(1 + i)² / (1 - i²) = 2i / 2 = i.' },
                { questionText: 'If z₁ = 3 – 2i and z₂ = 6 + 4i, find z₁ / z₂.', options: ['(5/26) – (6/13)i', '(5/13) – (6/26)i', '(5/26) + (6/13)i', '(10/52) – (24/52)i'], correctAnswer: 0, explanation: '(3 - 2i)(6 - 4i)/52 = (10 - 24i)/52 = (5/26) - (6/13)i.' },
                { questionText: 'Find the value of Im(i · z) if z = 3 + 2i.', options: ['2', '3', '–2', '–3'], correctAnswer: 1, explanation: 'i · z = i(3 + 2i) = -2 + 3i. Im(-2 + 3i) = 3.' },
                { questionText: 'If z = (2 + 3i)(1 – i), what is z?', options: ['5 + i', '5 – i', '1 + i', '–1 + i'], correctAnswer: 0, explanation: '(2 + 3i)(1 - i) = 2 - 2i + 3i + 3 = 5 + i.' },
                { questionText: 'For z = 3 + 4i, find Re(1/z).', options: ['3/25', '4/25', '–3/25', '–4/25'], correctAnswer: 0, explanation: '1/(3 + 4i) = (3 - 4i)/25. Re(1/z) = 3/25.' },
                { questionText: 'Simplify (1 + i)².', options: ['2i', '–2i', '2', '0'], correctAnswer: 0, explanation: '(1 + i)² = 1 + 2i - 1 = 2i.' },
                { questionText: 'If z + 3 = 1 + 4i, find z in rectangular form.', options: ['2 + 3i', '2 – 3i', '–2 + 3i', '3 + 2i'], correctAnswer: 0, explanation: 'z = 1 + 4i - 3 = -2 + 4i.' },
                { questionText: 'Find the imaginary part of (3 + 4i) / (5 – 12i).', options: ['33/169', '56/169', '–33/169', '–56/169'], correctAnswer: 1, explanation: '(3 + 4i)/(5 - 12i) = (-33 + 56i)/169. Imaginary part is 56/169.' }
            ];

            const qList = tData.order === 2 ? ex2_2_questions : (tData.order === 3 ? ex2_3_questions : (tData.order === 4 ? ex2_4_questions : [
                {
                    questionText: `Assessment question for ${tData.name}`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 0
                }
            ]));

            const topicAss = new Assessment({
                topicId: topic._id,
                type: 'TOPIC',
                passScore: 70,
                questions: qList
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
