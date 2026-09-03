const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');
const LearningContent = require('../models/LearningContent');
require('dotenv').config();

const seedAdaptiveData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning');
        console.log('Connected to MongoDB for adaptive seeding...');

        // Find Math subject
        const mathSubject = await Subject.findOne({ name: 'Mathematics' });
        if (!mathSubject) {
            console.error('Mathematics subject not found. Run seed.js first.');
            process.exit(1);
        }

        // Find or create Chapter 2
        let mathCh2 = await Chapter.findOne({ subjectId: mathSubject._id, chapterName: 'Chapter 2: Complex Numbers' });
        if (!mathCh2) {
            mathCh2 = new Chapter({
                subjectId: mathSubject._id,
                chapterName: 'Chapter 2: Complex Numbers',
                order: 2
            });
            await mathCh2.save();
        }

        // Clear existing related data for a clean slate on Chapter 2
        await Topic.deleteMany({ chapterId: mathCh2._id });
        await Assessment.deleteMany({ chapterId: mathCh2._id });
        await LearningContent.deleteMany({ chapterId: mathCh2._id });

        // 1. Seed LearningContent (Trailer and Main PPT)
        await LearningContent.insertMany([
            {
                chapterId: mathCh2._id,
                type: 'TRAILER',
                driveLink: 'https://drive.google.com/file/d/1-JPwvWHTjt2OiJSl-mUU1CAIbi82DT96/preview',
                title: 'Chapter 2 Trailer'
            },
            {
                chapterId: mathCh2._id,
                type: 'MAIN_PPT',
                driveLink: 'https://drive.google.com/file/d/1YLOgf-Z6oYtzv1qAssKC9exWebl8DdRk/preview',
                title: 'Chapter 2 Main Presentation'
            }
        ]);

        // 2. Seed INITIAL Assessment
        const initialAss = new Assessment({
            chapterId: mathCh2._id,
            type: 'INITIAL',
            passScore: 0, // Not strict pass/fail, used for adaptive leveling
            questions: [
                {
                    questionText: 'What is the standard form of a complex number?',
                    options: ['a + b', 'a + bi', 'ab', 'a/b'],
                    correctAnswer: 1
                },
                {
                    questionText: 'What is the value of i^2?',
                    options: ['1', '0', '-1', 'i'],
                    correctAnswer: 2
                },
                {
                    questionText: 'Which of the following correctly states the commutative property under addition for complex numbers?',
                    options: ['z₁ + z₂ = z₁ − z₂', 'z₁ · z₂ = z₂ + z₁', 'z₁ + z₂ = z₂ + z₁', 'z₁ + z₂ = z₁ · z₂'],
                    correctAnswer: 2
                }
            ]
        });
        await initialAss.save();

        // 3. Seed FINAL Assessment
        const finalAss = new Assessment({
            chapterId: mathCh2._id,
            type: 'FINAL',
            passScore: 70,
            questions: [
                {
                    questionText: 'Evaluate (3+4i) + (2-i).',
                    options: ['5+5i', '5+3i', '1+5i', '5-3i'],
                    correctAnswer: 1
                },
                {
                    questionText: 'Find the modulus of 3+4i.',
                    options: ['5', '7', '12', '25'],
                    correctAnswer: 0
                }
            ]
        });
        await finalAss.save();

        // 4. Seed Topics and Topic Assessments (Micro Content)
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

            // Link a topic assessment
            const topicAss = new Assessment({
                topicId: topic._id,
                type: 'TOPIC',
                passScore: 70,
                questions: [
                    {
                        questionText: `Sample question for ${tData.name}`,
                        options: ['A', 'B', 'C', 'D'],
                        correctAnswer: 0
                    }
                ]
            });
            await topicAss.save();
        }

        console.log('Seeded Adaptive Data for Chapter 2 successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedAdaptiveData();
