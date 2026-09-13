const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Topic = require('../models/Topic');
const Assessment = require('../models/Assessment');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning';

const ex2_3_questions = [
  {
    questionText: 'For any two complex numbers z₁ and z₂, the equation z₁ + z₂ = z₂ + z₁ illustrates which property?',
    options: ['Commutative property', 'Associative property', 'Closure property', 'Distributive property'],
    correctAnswer: 0,
    explanation: 'z1 + z2 = z2 + z1 represents the Commutative property of addition.'
  },
  {
    questionText: 'For any three complex numbers z₁, z₂, z₃, the equation (z₁ + z₂) + z₃ = z₁ + (z₂ + z₃) illustrates which property?',
    options: ['Closure property', 'Commutative property', 'Associative property', 'Distributive property'],
    correctAnswer: 2, // Option C
    explanation: '(z1 + z2) + z3 = z1 + (z2 + z3) represents the Associative property of addition.'
  },
  {
    questionText: 'If z₁ = 1 – 3i, z₂ = –4i and z₃ = 5, what is the value of (z₁ + z₂) + z₃?',
    options: ['6 – 7i', '–6 + 7i', '6 + 7i', '–4 – 7i'],
    correctAnswer: 0,
    explanation: '(1 - 3i - 4i) + 5 = (1 - 7i) + 5 = 6 - 7i.'
  },
  {
    questionText: 'If z₁ = 1 – 3i, z₂ = –4i and z₃ = 5, what is the value of z₁(z₂ + z₃)?',
    options: ['–7 – 19i', '7 + 19i', '–7 + 19i', '–19 – 7i'],
    correctAnswer: 0,
    explanation: 'z2 + z3 = 5 - 4i. z1(z2 + z3) = (1 - 3i)(5 - 4i) = 5 - 4i - 15i - 12 = -7 - 19i.'
  },
  {
    questionText: 'If z₁ = 3, z₂ = –7i and z₃ = 5 + 4i, what is the value of z₁z₂ + z₁z₃ (by the distributive property)?',
    options: ['15 – 9i', '–15 + 9i', '15 + 9i', '9 – 15i'],
    correctAnswer: 0,
    explanation: 'z1(z2 + z3) = 3(-7i + 5 + 4i) = 3(5 - 3i) = 15 - 9i.'
  },
  {
    questionText: 'What is the multiplicative inverse of a nonzero complex number z = x + iy?',
    options: [
      'x/(x² + y²) + iy/(x² + y²)',
      '(x² + y²)/x – iy',
      'x/(x² + y²) – iy/(x² + y²)',
      '–x/(x² + y²) + iy/(x² + y²)'
    ],
    correctAnswer: 2, // Option C
    explanation: '1/(x + iy) = (x - iy)/(x² + y²) = x/(x² + y²) - iy/(x² + y²).'
  },
  {
    questionText: 'If z₁ = 2 + 5i, what is the additive inverse of z₁?',
    options: ['–2 – 5i', '2 – 5i', '–2 + 5i', '5 + 2i'],
    correctAnswer: 0,
    explanation: '-z1 = -(2 + 5i) = -2 - 5i.'
  },
  {
    questionText: 'If z₁ = 2 + 5i, what is the multiplicative inverse of z₁?',
    options: ['2/29 – 5i/29', '2/29 + 5i/29', '–2/29 – 5i/29', '5/29 – 2i/29'],
    correctAnswer: 0,
    explanation: '1/(2 + 5i) = (2 - 5i)/(4 + 25) = 2/29 - 5i/29.'
  },
  {
    questionText: 'The conjugate of the complex number z = x + iy is defined as:',
    options: ['x – iy', '–x + iy', 'x + iy', '–x – iy'],
    correctAnswer: 0,
    explanation: 'The conjugate of z = x + iy is z_bar = x - iy.'
  },
  {
    questionText: 'If z = 4 + 7i, what is the value of z plus its conjugate (z + conjugate of z)?',
    options: ['8', '14i', '8 + 14i', '0'],
    correctAnswer: 0,
    explanation: 'z + z_bar = (4 + 7i) + (4 - 7i) = 8.'
  }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB:', mongoURI.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(mongoURI);

        const allTopics = await Topic.find({});
        const topics2_3 = allTopics.filter(t => (t.topicName && t.topicName.includes('2.3')) || (t.order === 3 && t.topicName && t.topicName.toLowerCase().includes('algebraic')));

        console.log(`Found ${topics2_3.length} Topic 2.3 candidates.`);

        for (let topic of topics2_3) {
            console.log(`Updating Topic ID ${topic._id} (${topic.topicName})...`);
            let ass = await Assessment.findOne({ topicId: topic._id });
            if (!ass) {
                ass = new Assessment({ topicId: topic._id, type: 'TOPIC', passScore: 70 });
            }
            ass.questions = ex2_3_questions;
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
