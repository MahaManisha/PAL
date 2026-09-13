const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning';

const ex2_4_questions = [
  {
    questionText: 'Find the real part of (3 + 4i) / (5 – 12i).',
    options: ['33/169', '–33/169', '56/169', '–56/169'],
    correctAnswer: 1, // B
    explanation: '(3 + 4i)(5 + 12i) / 169 = (-33 + 56i) / 169. Real part is -33/169.'
  },
  {
    questionText: 'If z = 2 + 3i, find z⁻¹ in rectangular form.',
    options: ['(2/13) – (3/13)i', '(2/5) – (3/5)i', '(2/13) + (3/13)i', '2 – 3i'],
    correctAnswer: 0, // A
    explanation: '1/(2 + 3i) = (2 - 3i)/13 = (2/13) - (3/13)i.'
  },
  {
    questionText: 'Evaluate (1 + i) / (1 – i).',
    options: ['1', 'i', '–i', '0'],
    correctAnswer: 1, // B
    explanation: '(1 + i)² / (1 - i²) = 2i / 2 = i.'
  },
  {
    questionText: 'If z₁ = 3 – 2i and z₂ = 6 + 4i, find z₁ / z₂.',
    options: ['(5/26) – (6/13)i', '(5/13) – (6/26)i', '(5/26) + (6/13)i', '(10/52) – (24/52)i'],
    correctAnswer: 0, // A
    explanation: '(3 - 2i)(6 - 4i)/52 = (10 - 24i)/52 = (5/26) - (6/13)i.'
  },
  {
    questionText: 'Find the value of Im(i · z) if z = 3 + 2i.',
    options: ['2', '3', '–2', '–3'],
    correctAnswer: 1, // B
    explanation: 'i · z = i(3 + 2i) = -2 + 3i. Im(-2 + 3i) = 3.'
  },
  {
    questionText: 'If z = (2 + 3i)(1 – i), what is z?',
    options: ['5 + i', '5 – i', '1 + i', '–1 + i'],
    correctAnswer: 0, // A
    explanation: '(2 + 3i)(1 - i) = 2 - 2i + 3i + 3 = 5 + i.'
  },
  {
    questionText: 'For z = 3 + 4i, find Re(1/z).',
    options: ['3/25', '4/25', '–3/25', '–4/25'],
    correctAnswer: 0, // A
    explanation: '1/(3 + 4i) = (3 - 4i)/25. Re(1/z) = 3/25.'
  },
  {
    questionText: 'Simplify (1 + i)².',
    options: ['2i', '–2i', '2', '0'],
    correctAnswer: 0, // A
    explanation: '(1 + i)² = 1 + 2i - 1 = 2i.'
  },
  {
    questionText: 'If z + 3 = 1 + 4i, find z in rectangular form.',
    options: ['2 + 3i', '2 – 3i', '–2 + 3i', '3 + 2i'],
    correctAnswer: 0, // A
    explanation: 'z = 1 + 4i - 3 = -2 + 4i.'
  },
  {
    questionText: 'Find the imaginary part of (3 + 4i) / (5 – 12i).',
    options: ['33/169', '56/169', '–33/169', '–56/169'],
    correctAnswer: 1, // B
    explanation: '(3 + 4i)/(5 - 12i) = (-33 + 56i)/169. Imaginary part is 56/169.'
  }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB:', mongoURI.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(mongoURI);

        const allTopics = await Topic.find({});
        const topics2_4 = allTopics.filter(t => (t.topicName && t.topicName.includes('2.4')) || (t.order === 4 && t.topicName && t.topicName.toLowerCase().includes('conjugate')));

        console.log(`Found ${topics2_4.length} Topic 2.4 candidates.`);

        for (let topic of topics2_4) {
            console.log(`Updating Topic ID ${topic._id} (${topic.topicName})...`);
            let ass = await Assessment.findOne({ topicId: topic._id });
            if (!ass) {
                ass = new Assessment({ topicId: topic._id, type: 'TOPIC', passScore: 70 });
            }
            ass.questions = ex2_4_questions;
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
