const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Assessment = require('../models/Assessment');
const Chapter = require('../models/Chapter');

const rawQuestions = [
  {
    "questionNumber": 1,
    "question": "What is the value of i^2?",
    "options": ["1", "-1", "i", "-i"],
    "answer": "-1",
    "explanation": "By definition, i is defined as the square root of -1, so i^2 = -1."
  },
  {
    "questionNumber": 2,
    "question": "If z = a + ib, what is the real part if z is a pure imaginary number?",
    "options": ["a", "b", "0", "1"],
    "answer": "0",
    "explanation": "A pure imaginary number has no real component, meaning the real part (a) is 0."
  },
  {
    "questionNumber": 3,
    "question": "Complex numbers extend the real number system primarily to solve equations that have:",
    "options": ["Real solutions", "No real solutions", "Rational solutions only", "Integer solutions only"],
    "answer": "No real solutions",
    "explanation": "Complex numbers were introduced specifically to provide solutions to polynomial equations like x^2 + 1 = 0, which have no real solutions."
  },
  {
    "questionNumber": 4,
    "question": "For z = 3 + 4i, what is the imaginary part?",
    "options": ["3", "4", "4i", "7"],
    "answer": "4",
    "explanation": "In the form z = a + ib, the imaginary part is b, which is 4 in this case."
  },
  {
    "questionNumber": 5,
    "question": "Two complex numbers z1 = a + ib and z2 = c + id are equal if and only if:",
    "options": ["a = c", "b = d", "a = c and b = d", "a + b = c + d"],
    "answer": "a = c and b = d",
    "explanation": "Equality of complex numbers requires both their real parts and their imaginary parts to be identical."
  },
  {
    "questionNumber": 6,
    "question": "If z = a + ib is a real number, what must be true?",
    "options": ["a = 0", "b = 0", "a = b", "a = 1"],
    "answer": "b = 0",
    "explanation": "A number is purely real if its imaginary part, b, is equal to 0."
  },
  {
    "questionNumber": 7,
    "question": "What is (1 + i) + (2 + 3i)?",
    "options": ["3 + 4i", "2 + 4i", "3 + 3i", "4 + 3i"],
    "answer": "3 + 4i",
    "explanation": "(1+2) + i(1+3) = 3 + 4i."
  },
  {
    "questionNumber": 8,
    "question": "What is the result of (1 + i)(1 - i)?",
    "options": ["0", "1", "2", "1 + i"],
    "answer": "2",
    "explanation": "Using (a+b)(a-b) = a^2 - b^2, this becomes 1^2 - i^2 = 1 - (-1) = 2."
  },
  {
    "questionNumber": 9,
    "question": "How is division (a+ib)/(c+id) simplified?",
    "options": [
      "Multiplying numerator and denominator by c + id",
      "Multiplying numerator and denominator by c - id",
      "Multiplying by i",
      "Multiplying by the conjugate of the numerator"
    ],
    "answer": "Multiplying numerator and denominator by c - id",
    "explanation": "Multiplying both parts by the conjugate of the denominator (c - id) eliminates the imaginary unit from the denominator."
  },
  {
    "questionNumber": 10,
    "question": "What is the conjugate of 3 + 2i?",
    "options": ["3 + 2i", "3 - 2i", "-3 + 2i", "-3 - 2i"],
    "answer": "3 - 2i",
    "explanation": "The conjugate of z = a + ib is z_bar = a - ib."
  },
  {
    "questionNumber": 11,
    "question": "Which of the following is a property of the conjugate?",
    "options": ["z * z_bar = |z|^2", "z + z_bar = 0", "z * z_bar = 0", "z_bar = z"],
    "answer": "z * z_bar = |z|^2",
    "explanation": "Multiplying a complex number by its conjugate results in the square of its modulus, i.e., z*z_bar = |z|^2."
  },
  {
    "questionNumber": 12,
    "question": "What is the conjugate of the product of two complex numbers z1 and z2?",
    "options": ["z1_bar + z2_bar", "z1_bar * z2_bar", "-(z1_bar * z2_bar)", "z1 * z2"],
    "answer": "z1_bar * z2_bar",
    "explanation": "The conjugate of a product is equal to the product of the individual conjugates: (z1 * z2)_bar = z1_bar * z2_bar."
  },
  {
    "questionNumber": 13,
    "question": "What is the modulus of z = 3 + 4i?",
    "options": ["5", "7", "1", "12"],
    "answer": "5",
    "explanation": "|z| = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5."
  },
  {
    "questionNumber": 14,
    "question": "What does the modulus |z| represent in the Argand plane?",
    "options": ["The real part of z", "The imaginary part of z", "The distance from the origin", "The angle of z"],
    "answer": "The distance from the origin",
    "explanation": "The modulus |z| corresponds to the geometric distance from the point (0,0) to the point (a,b) in the Argand plane."
  },
  {
    "questionNumber": 15,
    "question": "Which of the following properties of the modulus is INCORRECT?",
    "options": [
      "|z1 * z2| = |z1| * |z2|",
      "|z1 / z2| = |z1| / |z2|",
      "|z1 + z2| = |z1| + |z2|",
      "|z|^2 = z * z_bar"
    ],
    "answer": "|z1 + z2| = |z1| + |z2|",
    "explanation": "The triangle inequality states |z1 + z2| <= |z1| + |z2|. The equality only holds under specific conditions, so it is not a general property."
  },
  {
    "questionNumber": 16,
    "question": "In the Argand plane, the horizontal axis represents:",
    "options": ["Imaginary numbers", "Real numbers", "The modulus", "The argument"],
    "answer": "Real numbers",
    "explanation": "The Argand plane uses the horizontal axis for the real part of a complex number and the vertical axis for the imaginary part."
  },
  {
    "questionNumber": 17,
    "question": "What does the equation |z| = r represent?",
    "options": [
      "A line",
      "A circle with center at origin and radius r",
      "A circle with center at z and radius r",
      "A parabola"
    ],
    "answer": "A circle with center at origin and radius r",
    "explanation": "The set of points at a constant distance 'r' from the origin forms a circle with center (0,0)."
  },
  {
    "questionNumber": 18,
    "question": "What does the equation |z - z0| = r represent?",
    "options": [
      "A circle with center 0 and radius r",
      "A circle with center z0 and radius r",
      "A line passing through z0",
      "A point at z0"
    ],
    "answer": "A circle with center z0 and radius r",
    "explanation": "This represents the locus of points 'z' whose distance to 'z0' is exactly 'r', forming a circle centered at 'z0' with radius 'r'."
  },
  {
    "questionNumber": 19,
    "question": "What is the Euler's form of a complex number?",
    "options": ["z = a + ib", "z = r(cos θ + i sin θ)", "z = r * e^(iθ)", "z = r * e^(-iθ)"],
    "answer": "z = r * e^(iθ)",
    "explanation": "Euler's formula defines z = r * e^(iθ) as the exponential form of a complex number."
  },
  {
    "questionNumber": 20,
    "question": "What is the relationship between Euler's formula and trigonometric functions?",
    "options": [
      "e^(iθ) = sin θ + i cos θ",
      "e^(iθ) = cos θ + i sin θ",
      "e^(iθ) = cos θ - i sin θ",
      "e^(iθ) = sin θ - i cos θ"
    ],
    "answer": "e^(iθ) = cos θ + i sin θ",
    "explanation": "Euler's identity states e^(iθ) = cos(θ) + i*sin(θ)."
  },
  {
    "questionNumber": 21,
    "question": "For z = a + ib, how is θ = arg(z) calculated?",
    "options": ["tan θ = a/b", "tan θ = b/a", "cos θ = b/a", "sin θ = a/b"],
    "answer": "tan θ = b/a",
    "explanation": "The argument θ is defined such that tan(θ) = (Imaginary part) / (Real part) = b / a."
  },
  {
    "questionNumber": 22,
    "question": "What is the value of (cos θ + i sin θ)^n?",
    "options": [
      "cos(nθ) + i sin(nθ)",
      "cos(θ^n) + i sin(θ^n)",
      "n * cos θ + i * n * sin θ",
      "cos(θ/n) + i sin(θ/n)"
    ],
    "answer": "cos(nθ) + i sin(nθ)",
    "explanation": "De Moivre's theorem states that (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ)."
  },
  {
    "questionNumber": 23,
    "question": "De Moivre's theorem applies to which powers n?",
    "options": ["Only positive integers", "Only negative integers", "Any integer n", "Only fractions"],
    "answer": "Any integer n",
    "explanation": "De Moivre's theorem holds for any integer value of n."
  },
  {
    "questionNumber": 24,
    "question": "The nth roots of z = r(cos θ + i sin θ) are given by:",
    "options": [
      "r^(1/n) [cos((θ+2kπ)/n) + i sin((θ+2kπ)/n)]",
      "r^n [cos((θ+2kπ)/n) + i sin((θ+2kπ)/n)]",
      "r^(1/n) [cos(θ+2kπ) + i sin(θ+2kπ)]",
      "r^n [cos(nθ+2kπ) + i sin(nθ+2kπ)]"
    ],
    "answer": "r^(1/n) [cos((θ+2kπ)/n) + i sin((θ+2kπ)/n)]",
    "explanation": "This is the standard formula for finding all n roots of a complex number using polar coordinates and modular periodicity."
  }
];

const formattedQuestions = rawQuestions.map(q => {
    return {
        questionText: q.question,
        options: q.options,
        correctAnswer: q.options.indexOf(q.answer), // calculate zero-indexed answer
        explanation: q.explanation
    };
});

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daz_learning');
        
        const ch2 = await Chapter.findOne({ chapterName: /Chapter 2: Complex Numbers/i });
        if (!ch2) {
            console.error("Chapter 2 not found");
            process.exit(1);
        }

        let assessment = await Assessment.findOne({ chapterId: ch2._id, type: 'INITIAL' });
        
        if (assessment) {
            assessment.questions = formattedQuestions;
            assessment.passScore = 70; // 70%
            await assessment.save();
            console.log("Updated Chapter 2 INITIAL Assessment with 24 questions.");
        } else {
            assessment = new Assessment({
                chapterId: ch2._id,
                type: 'INITIAL',
                questions: formattedQuestions,
                passScore: 70
            });
            await assessment.save();
            console.log("Created Chapter 2 INITIAL Assessment with 24 questions.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
