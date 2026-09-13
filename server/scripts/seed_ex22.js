const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning';

const ex2_2_questions = [
  {
    questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of z + w?',
    options: ['1 + 7i', '1 – 7i', '–1 + 7i', '3 – i'],
    correctAnswer: 0,
    explanation: 'z + w = (2 + (-1)) + (3 + 4)i = 1 + 7i.'
  },
  {
    questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of z – iw?',
    options: ['6 + 4i', '6 – 4i', '–6 + 4i', '–2 + 2i'],
    correctAnswer: 0,
    explanation: 'z - iw = (2 + 3i) - i(-1 + 4i) = 2 + 3i + i + 4 = 6 + 4i.'
  },
  {
    questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of 2z + 3w?',
    options: ['1 + 18i', '–1 + 18i', '7 + 2i', '1 – 18i'],
    correctAnswer: 0,
    explanation: '2z + 3w = 2(2 + 3i) + 3(-1 + 4i) = (4 - 3) + (6 + 12)i = 1 + 18i.'
  },
  {
    questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of zw?',
    options: ['–14 + 5i', '14 + 5i', '–14 – 5i', '2 + 5i'],
    correctAnswer: 0,
    explanation: 'zw = (2 + 3i)(-1 + 4i) = -2 + 8i - 3i - 12 = -14 + 5i.'
  },
  {
    questionText: 'If z = 2 + 3i and w = –1 + 4i, what is the value of (z + w)²?',
    options: ['–48 + 14i', '48 + 14i', '–48 – 14i', '14 – 48i'],
    correctAnswer: 0,
    explanation: 'z + w = 1 + 7i. (1 + 7i)² = 1 + 14i - 49 = -48 + 14i.'
  },
  {
    questionText: 'If z₁ = 6 + 7i and z₂ = 3 – 5i, what is the value of z₁ – z₂?',
    options: ['3 + 12i', '3 – 12i', '–3 + 12i', '9 + 2i'],
    correctAnswer: 0,
    explanation: 'z1 - z2 = (6 - 3) + (7 - (-5))i = 3 + 12i.'
  },
  {
    questionText: 'If z = 2 + 3i, what is iz, the image of z after a 90° rotation about the origin?',
    options: ['–3 + 2i', '3 + 2i', '–3 – 2i', '3 – 2i'],
    correctAnswer: 0,
    explanation: 'iz = i(2 + 3i) = 2i + 3i² = -3 + 2i.'
  },
  {
    questionText: 'If z = 2 + 3i, what is the value of z + iz?',
    options: ['–1 + 5i', '1 + 5i', '–1 – 5i', '5 – i'],
    correctAnswer: 0,
    explanation: 'z + iz = (2 + 3i) + (-3 + 2i) = -1 + 5i.'
  },
  {
    questionText: 'If x and y are real numbers such that (x + iy) + (1 – 2i) = 4 + 3i, what is the value of x + y?',
    options: ['8', '–8', '2', '15'],
    correctAnswer: 0,
    explanation: '(x + 1) + i(y - 2) = 4 + 3i => x = 3, y = 5 => x + y = 8.'
  },
  {
    questionText: 'If real numbers x and y satisfy 2x + 3iy = 6 – 9i, what is the value of x – y?',
    options: ['6', '0', '–6', '3'],
    correctAnswer: 0,
    explanation: '2x = 6 => x = 3; 3y = -9 => y = -3 => x - y = 3 - (-3) = 6.'
  }
];

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const allTopics = await Topic.find({});
        const topics2_2 = allTopics.filter(t => (t.topicName && t.topicName.includes('2.2')) || (t.order === 2 && t.topicName && t.topicName.toLowerCase().includes('algebraic')));

        console.log(`Found ${topics2_2.length} topic 2.2 candidates.`);

        for (let topic of topics2_2) {
            console.log(`Updating Topic ID ${topic._id} (${topic.topicName})...`);
            let ass = await Assessment.findOne({ topicId: topic._id });
            if (!ass) {
                ass = new Assessment({ topicId: topic._id, type: 'TOPIC', passScore: 70 });
            }
            ass.questions = ex2_2_questions;
            ass.passScore = 70;
            await ass.save();
            console.log(`Saved 10 assessment questions for Topic ID ${topic._id}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
