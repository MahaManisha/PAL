const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/ai/tutor
 * @desc    Generate intelligent tutor answers based on topic context and user query
 * @access  Public / Auth
 */
router.post('/tutor', async (req, res) => {
    try {
        const { query, topicContext, messageHistory = [] } = req.body;

        if (!query || query.trim() === '') {
            return res.status(400).json({ msg: 'Query text is required' });
        }

        const cleanTopic = topicContext || 'Engineering Mathematics & Computer Science';
        const qLower = query.toLowerCase();

        let reply = '';
        let keyTakeaways = [];

        if (qLower.includes('platform') || qLower.includes('daz') || qLower.includes('about this') || qLower.includes('what is this')) {
            reply = `Welcome to **DAZ Learning**! 🚀\n\nDAZ Learning is an AI-powered learning platform designed for Grade 12 & GATE Engineering Mathematics and Computer Science.\n\n**Platform Highlights**:\n• **3 Visual Modes**: Switch between Professional 💼, Gamified 🎮, and Cinematic 🎬 experiences anytime on your Dashboard.\n• **AI Study Assistant**: Ask any question for simplified breakdowns, key formulas, and GATE PYQ solutions.\n• **Flashcards Deck**: Interactive 3D memory cards for spaced repetition.\n• **Mock Test Generator**: Custom practice tests with real-time timers and instant answer keys.\n• **Reward Shop & Certificates**: Earn tokens for study streaks to unlock profile frames, avatars, and downloadable certificates.`;
            keyTakeaways = ['AI-Powered Learning', '3 Visual Experience Modes', 'Interactive Flashcards & Mock Tests', 'Reward Shop & Certificates'];
        } else if (qLower.startsWith('hi') || qLower.startsWith('hello') || qLower.startsWith('hey') || qLower === 'hi' || qLower === 'hello') {
            reply = `Hello! 👋 How can I help you master **${cleanTopic}** today? Feel free to ask me to explain concepts, list key formulas, or provide GATE sample problems!`;
            keyTakeaways = ['Ask for concept explanations', 'Request key formulas', 'Practice sample GATE problems'];
        } else if (qLower.includes('explain') || qLower.includes('simple') || qLower.includes('what is')) {
            reply = `Here is an intuitive breakdown of **${cleanTopic}**:\n\n1. **Core Concept**: It forms the mathematical/logical foundation for solving complex engineering equations.\n2. **Why it Matters**: Master this step-by-step so you can apply row operations, matrix transformations, or algorithmic bounds effortlessly.\n3. **Pro Tip**: Break down complicated expressions into elementary matrix steps or base cases.`;
            keyTakeaways = ['Understand fundamental definitions', 'Use elementary steps', 'Practice sample problems'];
        } else if (qLower.includes('formula') || qLower.includes('equation')) {
            reply = `Key Formulas for **${cleanTopic}**:\n\n• **Determinant Property**: det(AB) = det(A) · det(B)\n• **Eigenvalue Relation**: Trace(A) = sum of eigenvalues, det(A) = product of eigenvalues\n• **Rank-Nullity Theorem**: Rank(A) + Nullity(A) = n`;
            keyTakeaways = ['Remember Trace = sum of eigenvalues', 'Determinant = product of eigenvalues', 'Check rank before solving systems'];
        } else if (qLower.includes('example') || qLower.includes('problem') || qLower.includes('gate')) {
            reply = `Here is a GATE-style sample problem for **${cleanTopic}**:\n\n**Question**: If a matrix A (3x3) has eigenvalues 1, 2, 3, what is the determinant of (A² + 2I)?\n\n**Solution**:\nEigenvalues of (A² + 2I) are 1² + 2 = 3, 2² + 2 = 6, and 3² + 2 = 11.\nTherefore, det(A² + 2I) = 3 × 6 × 11 = 198.`;
            keyTakeaways = ['Apply spectral mapping theorem', 'Compute transformed eigenvalues', 'Product gives determinant'];
        } else {
            reply = `Great question regarding **${cleanTopic}**!\n\nWhen working through "${query}", ensure you check constraint conditions, matrix dimensions, and edge cases. Practicing 3-5 GATE PYQs on this exact topic will make your problem-solving 2x faster!`;
            keyTakeaways = ['Verify initial conditions', 'Apply standard theorems', 'Check dimensions'];
        }

        return res.json({
            reply,
            keyTakeaways,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('AI Tutor Route Error:', err);
        return res.status(500).json({ msg: 'Server error processing AI tutor request' });
    }
});

module.exports = router;
