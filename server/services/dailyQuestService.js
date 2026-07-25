const DailyQuest = require('../models/DailyQuest');

const CANONICAL_GATE_QUESTIONS = [
    { key: 'GATE_001', questionText: 'The rank of the matrix [[1,2,3],[4,5,6],[7,8,9]] is:', options: ['0', '1', '2', '3'], correctAnswer: 2, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_002', questionText: 'The eigenvalues of the matrix [[2,1],[0,3]] are:', options: ['1 and 3', '2 and 3', '1 and 2', '0 and 5'], correctAnswer: 1, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_003', questionText: 'Which of the following is NOT a property of an invertible matrix?', options: ['Its determinant is non-zero', 'Its rank equals its order', 'It has at least one zero eigenvalue', 'Its rows are linearly independent'], correctAnswer: 2, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_004', questionText: 'The number of solutions to Ax = b, where A is 3×3 with rank 2 and b is consistent, is:', options: ['Exactly one', 'Exactly two', 'Infinitely many', 'None'], correctAnswer: 2, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_005', questionText: 'Which integration technique is best for ∫ x·eˣ dx?', options: ['Substitution', 'Integration by parts', 'Partial fractions', 'Trigonometric substitution'], correctAnswer: 1, subject: 'Calculus', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_006', questionText: 'lim(x→0) sin(x)/x equals:', options: ['0', '∞', '1', 'Undefined'], correctAnswer: 2, subject: 'Calculus', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_007', questionText: 'The Laplace transform of the unit step function u(t) is:', options: ['1/s²', '1/s', 's', '1'], correctAnswer: 1, subject: 'Transforms', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_008', questionText: 'For binomial distribution B(n,p), the mean is:', options: ['np', 'npq', 'np²', 'n/p'], correctAnswer: 0, subject: 'Probability', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_009', questionText: 'For a 4×4 matrix, the maximum possible rank is:', options: ['2', '3', '4', '16'], correctAnswer: 2, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_010', questionText: 'The Fourier series of f(x) = x on [-π, π] contains only:', options: ['Cosine terms', 'Sine terms', 'Both sine and cosine', 'Only the constant term'], correctAnswer: 1, subject: 'Transforms', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_011', questionText: 'If A and B are square matrices, then (AB)ᵀ equals:', options: ['AᵀBᵀ', 'BᵀAᵀ', 'Aᵀ+Bᵀ', 'ABᵀ'], correctAnswer: 1, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_012', questionText: 'The PDE ∂²u/∂t² = c²·∂²u/∂x² is called the:', options: ['Heat equation', 'Laplace equation', 'Wave equation', 'Poisson equation'], correctAnswer: 2, subject: 'Differential Equations', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_013', questionText: 'Condition for unique solution of a linear system:', options: ['rank(A) < n', 'rank(A) = rank([A|b]) = n', 'det(A) = 0', 'rank(A) > n'], correctAnswer: 1, subject: 'Linear Algebra', category: 'GATE', difficulty: 'medium' },
    { key: 'GATE_014', questionText: 'Variance of a Poisson distribution with parameter λ is:', options: ['λ', 'λ²', '√λ', '1/λ'], correctAnswer: 0, subject: 'Probability', category: 'GATE', difficulty: 'medium' }
];

let catalogInitializedPromise = null;

/**
 * Non-destructive catalog initialization.
 * Upserts canonical 14 GATE questions without deleting existing records.
 */
const ensureDailyQuestCatalogInitialized = async () => {
    if (!catalogInitializedPromise) {
        catalogInitializedPromise = (async () => {
            try {
                for (const item of CANONICAL_GATE_QUESTIONS) {
                    await DailyQuest.updateOne(
                        { key: item.key },
                        { $setOnInsert: item },
                        { upsert: true }
                    );
                }
            } catch (err) {
                console.error('dailyQuestService.ensureDailyQuestCatalogInitialized error:', err);
                catalogInitializedPromise = null; // Reset on failure
            }
        })();
    }
    return catalogInitializedPromise;
};

// UTC Helpers
const getToday = () => new Date().toISOString().split('T')[0];

const getYesterday = () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
};

const getUtcDayOfYear = () => {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

/**
 * Deterministically selects today's DailyQuest from available records sorted by key.
 */
const getTodayQuest = async () => {
    await ensureDailyQuestCatalogInitialized();

    const availableQuests = await DailyQuest.find({ available: true })
        .sort({ key: 1 })
        .lean();

    if (!availableQuests || availableQuests.length === 0) {
        return null;
    }

    const dayOfYear = getUtcDayOfYear();
    const index = dayOfYear % availableQuests.length;
    return availableQuests[index];
};

/**
 * Fetches a DailyQuest by key.
 */
const getQuestByKey = async (key) => {
    await ensureDailyQuestCatalogInitialized();
    return DailyQuest.findOne({ key }).lean();
};

module.exports = {
    ensureDailyQuestCatalogInitialized,
    getToday,
    getYesterday,
    getUtcDayOfYear,
    getTodayQuest,
    getQuestByKey,
    CANONICAL_GATE_QUESTIONS
};
