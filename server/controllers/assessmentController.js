const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const User = require('../models/User');

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

exports.getAssessmentByTopic = async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ topicId: req.params.topicId });
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });
        res.json(assessment);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.submitAssessment = async (req, res) => {
    const { userId, topicId, answers } = req.body;
    try {
        const assessment = await Assessment.findOne({ topicId });
        if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });

        let correctCount = 0;
        assessment.questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) correctCount++;
        });

        const score = (correctCount / assessment.questions.length) * 100;
        const status = score >= assessment.passScore ? 'pass' : 'fail';

        const progress = new Progress({ userId, topicId, score, status });
        await progress.save();

        let updatedUser = null;
        if (status === 'pass') {
            const user = await User.findById(userId);
            if (user) {
                const today = getToday();
                const yesterday = getYesterday();
                if (user.lastStudyDate === yesterday) {
                    user.streak = (user.streak || 0) + 1;
                } else if (user.lastStudyDate !== today) {
                    user.streak = 1;
                }
                user.lastStudyDate = today;
                user.points = (user.points || 0) + 10;
                user.tokens = (user.tokens || 0) + 5;
                await user.save();
                updatedUser = {
                    id: user._id, name: user.name, email: user.email,
                    interest: user.interest, points: user.points,
                    streak: user.streak, tokens: user.tokens,
                    lastStudyDate: user.lastStudyDate,
                    completedDailyQuestDate: user.completedDailyQuestDate
                };
            }
        }

        res.json({ score, status, user: updatedUser });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const GATE_QUESTIONS = [
    { questionText: 'The rank of the matrix [[1,2,3],[4,5,6],[7,8,9]] is:', options: ['0', '1', '2', '3'], correctAnswer: 2, topic: 'Linear Algebra' },
    { questionText: 'The eigenvalues of the matrix [[2,1],[0,3]] are:', options: ['1 and 3', '2 and 3', '1 and 2', '0 and 5'], correctAnswer: 1, topic: 'Linear Algebra' },
    { questionText: 'Which of the following is NOT a property of an invertible matrix?', options: ['Its determinant is non-zero', 'Its rank equals its order', 'It has at least one zero eigenvalue', 'Its rows are linearly independent'], correctAnswer: 2, topic: 'Linear Algebra' },
    { questionText: 'The number of solutions to Ax = b, where A is 3×3 with rank 2 and b is consistent, is:', options: ['Exactly one', 'Exactly two', 'Infinitely many', 'None'], correctAnswer: 2, topic: 'Linear Algebra' },
    { questionText: 'Which integration technique is best for ∫ x·eˣ dx?', options: ['Substitution', 'Integration by parts', 'Partial fractions', 'Trigonometric substitution'], correctAnswer: 1, topic: 'Calculus' },
    { questionText: 'lim(x→0) sin(x)/x equals:', options: ['0', '∞', '1', 'Undefined'], correctAnswer: 2, topic: 'Calculus' },
    { questionText: 'The Laplace transform of the unit step function u(t) is:', options: ['1/s²', '1/s', 's', '1'], correctAnswer: 1, topic: 'Transforms' },
    { questionText: 'For binomial distribution B(n,p), the mean is:', options: ['np', 'npq', 'np²', 'n/p'], correctAnswer: 0, topic: 'Probability' },
    { questionText: 'For a 4×4 matrix, the maximum possible rank is:', options: ['2', '3', '4', '16'], correctAnswer: 2, topic: 'Linear Algebra' },
    { questionText: 'The Fourier series of f(x) = x on [-π, π] contains only:', options: ['Cosine terms', 'Sine terms', 'Both sine and cosine', 'Only the constant term'], correctAnswer: 1, topic: 'Transforms' },
    { questionText: 'If A and B are square matrices, then (AB)ᵀ equals:', options: ['AᵀBᵀ', 'BᵀAᵀ', 'Aᵀ+Bᵀ', 'ABᵀ'], correctAnswer: 1, topic: 'Linear Algebra' },
    { questionText: 'The PDE ∂²u/∂t² = c²·∂²u/∂x² is called the:', options: ['Heat equation', 'Laplace equation', 'Wave equation', 'Poisson equation'], correctAnswer: 2, topic: 'Differential Equations' },
    { questionText: 'Condition for unique solution of a linear system:', options: ['rank(A) < n', 'rank(A) = rank([A|b]) = n', 'det(A) = 0', 'rank(A) > n'], correctAnswer: 1, topic: 'Linear Algebra' },
    { questionText: 'Variance of a Poisson distribution with parameter λ is:', options: ['λ', 'λ²', '√λ', '1/λ'], correctAnswer: 0, topic: 'Probability' }
];

exports.getDailyQuest = async (req, res) => {
    try {
        const { userId } = req.params;
        const today = getToday();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const alreadyCompleted = user.completedDailyQuestDate === today;
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const questionIndex = dayOfYear % GATE_QUESTIONS.length;
        const { correctAnswer, ...safeQuestion } = GATE_QUESTIONS[questionIndex];

        res.json({
            question: { ...safeQuestion, id: questionIndex },
            alreadyCompleted,
            userStats: { points: user.points || 0, streak: user.streak || 0, tokens: user.tokens || 0 }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.submitDailyQuest = async (req, res) => {
    try {
        const { userId, questionId, answer } = req.body;
        const today = getToday();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.completedDailyQuestDate === today) {
            return res.json({ msg: 'Already completed today', alreadyCompleted: true });
        }

        const question = GATE_QUESTIONS[questionId];
        const isCorrect = question && (question.correctAnswer === answer);

        if (isCorrect) {
            user.points = (user.points || 0) + 1;
            user.tokens = (user.tokens || 0) + 1;
            const yesterday = getYesterday();
            if (user.lastStudyDate === yesterday) {
                user.streak = (user.streak || 0) + 1;
            } else if (user.lastStudyDate !== today) {
                user.streak = 1;
            }
            user.lastStudyDate = today;
            user.completedDailyQuestDate = today;
            await user.save();
        }

        res.json({
            isCorrect,
            correctAnswer: question ? question.correctAnswer : null,
            userStats: { points: user.points || 0, streak: user.streak || 0, tokens: user.tokens || 0 }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
