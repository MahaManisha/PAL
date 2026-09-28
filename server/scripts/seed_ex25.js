const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');
const LearningContent = require('../models/LearningContent');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning';

const ex2_5_questions = [
  {
    questionText: 'What is the modulus of the complex number z = (2 + i) / (i – 1)?',
    options: ['1', '√(5/2)', '5/2', '√5'],
    correctAnswer: 1, // B
    explanation: '|2 + i| = √(2² + 1²) = √5, |i - 1| = √((-1)² + 1²) = √2. So |z| = √5 / √2 = √(5/2).'
  },
  {
    questionText: 'If z is a complex number such that |z| = 1, what is the value of the product z · z̄?',
    options: ['0', '–1', '1', 'i'],
    correctAnswer: 2, // C
    explanation: 'For any complex number z, z · z̄ = |z|². Since |z| = 1, z · z̄ = 1² = 1.'
  },
  {
    questionText: 'Find the distance between the origin and the complex number z = –6 + 8i.',
    options: ['10', '14', '√14', '2'],
    correctAnswer: 0, // A
    explanation: 'Distance from origin is |z| = √((-6)² + 8²) = √(36 + 64) = √100 = 10.'
  },
  {
    questionText: 'If |z₁| = 3 and |z₂| = 4, what is the maximum possible value of |z₁ + z₂|?',
    options: ['1', '5', '7', '12'],
    correctAnswer: 2, // C
    explanation: 'By the triangle inequality, |z₁ + z₂| ≤ |z₁| + |z₂| = 3 + 4 = 7.'
  },
  {
    questionText: 'Let z₁, z₂ be two complex numbers such that |z₁| = |z₂| = 1 and z₁ z₂ ≠ –1. The number (z₁ + z₂) / (1 + z₁ z₂) is purely:',
    options: ['Imaginary', 'Real', 'Zero', 'Negative'],
    correctAnswer: 1, // B
    explanation: 'Since |z₁|=|z₂|=1, w̄ = (1/z₁ + 1/z₂) / (1 + 1/z₁z₂) = w. Hence w is purely real.'
  },
  {
    questionText: 'Which point is closest to the complex number 1 + i?',
    options: ['10 – 8i', '11 + 6i', 'Both are equidistant', 'None of these'],
    correctAnswer: 1, // B
    explanation: 'Distance to 11+6i is √((11-1)² + (6-1)²) = √125 ≈ 11.18, while distance to 10-8i is √162 ≈ 12.73. So 11+6i is closer.'
  },
  {
    questionText: 'If |z| = 3, what is the least (minimum) value of |z + 6 – 8i|?',
    options: ['7', '13', '10', '3'],
    correctAnswer: 0, // A
    explanation: 'Distance from origin to -6+8i is 10. Minimum distance from circle |z|=3 to -6+8i is 10 - 3 = 7.'
  },
  {
    questionText: 'The area of the triangle formed by the complex vertices z, iz, and z + iz is 50 sq. units. What is the value of |z|?',
    options: ['5', '10', '50', '100'],
    correctAnswer: 1, // B
    explanation: 'The triangle is a right isosceles triangle with legs of length |z|. Area = (1/2)|z|² = 50 => |z|² = 100 => |z| = 10.'
  },
  {
    questionText: 'If |z| = 1, what is the maximum value of |z² – 3|?',
    options: ['2', '3', '4', '1'],
    correctAnswer: 2, // C
    explanation: 'By the triangle inequality, |z² - 3| ≤ |z²| + |-3| = 1 + 3 = 4.'
  },
  {
    questionText: 'What is the value of the modulus expression |(1 + i)⁴|?',
    options: ['2', '4', '8', '16'],
    correctAnswer: 1, // B
    explanation: '|1 + i| = √(1² + 1²) = √2, so |(1 + i)⁴| = (√2)⁴ = 4.'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB!');

    // 1. Find Chapter 2
    const ch2 = await Chapter.findOne({ chapterName: /Chapter 2/i });
    if (!ch2) {
      console.error('Chapter 2 not found!');
      process.exit(1);
    }

    console.log(`Found Chapter 2 ID: ${ch2._id}`);

    // 2. Find or Create Topic 2.5
    let topic2_5 = await Topic.findOne({ chapterId: ch2._id, $or: [{ topicName: /2\.5/ }, { order: 5 }] });
    if (!topic2_5) {
      topic2_5 = new Topic({
        chapterId: ch2._id,
        topicName: '2.5 Modulus of a Complex Number',
        order: 5
      });
      await topic2_5.save();
      console.log(`Created Topic 2.5 ID: ${topic2_5._id}`);
    } else {
      topic2_5.topicName = '2.5 Modulus of a Complex Number';
      topic2_5.order = 5;
      await topic2_5.save();
      console.log(`Updated existing Topic 2.5 ID: ${topic2_5._id}`);
    }

    // 3. Learning Content (MICRO_VIDEO & MICRO_PPT)
    await LearningContent.deleteMany({ topicId: topic2_5._id });
    await LearningContent.insertMany([
      {
        chapterId: ch2._id,
        topicId: topic2_5._id,
        type: 'MICRO_VIDEO',
        driveLink: '/videos/Mathematics/Chapter%202/02_ComplexNumbers_Video.mp4',
        title: '2.5 Modulus of a Complex Number Lecture Video',
        order: 5
      },
      {
        chapterId: ch2._id,
        topicId: topic2_5._id,
        type: 'MICRO_PPT',
        driveLink: '/videos/Mathematics/Chapter%202/Micro_Content_Hub/2.5/2.5_Modulus_of_a_Complex_Number.pptx',
        title: '2.5 Modulus of a Complex Number Presentation',
        order: 5
      }
    ]);
    console.log('Seeded Learning Content for Topic 2.5.');

    // 4. Assessment for 2.5
    let ass = await Assessment.findOne({ topicId: topic2_5._id });
    if (!ass) {
      ass = new Assessment({
        topicId: topic2_5._id,
        type: 'TOPIC',
        passScore: 70
      });
    }
    ass.questions = ex2_5_questions;
    ass.passScore = 70;
    await ass.save();
    console.log('Seeded exact 10 Quiz Questions, Options & Answer Key for Topic 2.5!');

    console.log('Successfully seeded exact Exercise 2.5 Quiz Assessment!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Topic 2.5:', err);
    process.exit(1);
  }
}

seed();
