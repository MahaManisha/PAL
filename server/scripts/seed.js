const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Subject.deleteMany();
        await Chapter.deleteMany();
        await Topic.deleteMany();
        await Assessment.deleteMany();

        const subjects = [
            { name: 'Mathematics' },
            { name: 'Physics' },
            { name: 'Chemistry' }
        ];

        for (let s of subjects) {
            const subject = new Subject(s);
            await subject.save();

            const chapters = [
                { subjectId: subject._id, chapterName: `Chapter 1: Foundations of ${subject.name}`, order: 1 },
                { subjectId: subject._id, chapterName: `Chapter 2: Advanced ${subject.name}`, order: 2 }
            ];

            for (let c of chapters) {
                const chapter = new Chapter(c);
                await chapter.save();

                const topics = [
                    { chapterId: chapter._id, topicName: `Topic 1.1: Introduction to ${chapter.chapterName}`, order: 1 },
                    { chapterId: chapter._id, topicName: `Topic 1.2: Core Concepts of ${chapter.chapterName}`, order: 2 }
                ];

                for (let t of topics) {
                    const topic = new Topic(t);
                    await topic.save();

                    const assessment = new Assessment({
                        topicId: topic._id,
                        questions: [
                            {
                                questionText: `What is the primary focus of ${topic.topicName}?`,
                                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                correctAnswer: 0
                            },
                            {
                                questionText: `Which of these is a key principle in ${topic.topicName}?`,
                                options: ['Principle 1', 'Principle 2', 'Principle 3', 'Principle 4'],
                                correctAnswer: 1
                            }
                        ],
                        passScore: 70
                    });
                    await assessment.save();
                }
            }
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
