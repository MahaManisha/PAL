const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/ai/tutor
 * @desc    Generate intelligent tutor answers based on topic context and user query
 * @access  Public / Auth
 */
router.post('/tutor', async (req, res) => {
    try {
        const { query, topicContext, contextData = {}, messageHistory = [] } = req.body;

        if (!query || query.trim() === '') {
            return res.status(400).json({ msg: 'Query text is required' });
        }

        // Use contextData if provided, otherwise fallback to topicContext
        const cleanTopic = contextData.topicName || topicContext || 'Engineering Mathematics & Computer Science';
        const qLower = query.toLowerCase();

        let reply = '';
        let keyTakeaways = [];

        // Build a dynamic intro based on context
        let contextPrefix = '';
        if (contextData.topicName) {
            if (contextData.status === 'fail' || (contextData.weakAreas && contextData.weakAreas.length > 0)) {
                contextPrefix = `Based on your recent performance, I notice you might be struggling with **${cleanTopic}**. Let's break it down to strengthen this weak area.\n\n`;
            } else if (contextData.status === 'pass') {
                contextPrefix = `Great job mastering **${cleanTopic}** so far! Let's keep exploring.\n\n`;
            }
        }

        if (qLower.includes('platform') || qLower.includes('daz') || qLower.includes('about this') || qLower.includes('what is this')) {
            reply = `Welcome to **DAZ Learning**! 🚀\n\nDAZ Learning is an AI-powered learning platform designed for Grade 12 & GATE Engineering Mathematics and Computer Science.\n\n**Platform Highlights**:\n• **3 Visual Modes**: Switch between Professional 💼, Gamified 🎮, and Cinematic 🎬 experiences anytime on your Dashboard.\n• **AI Study Assistant**: Ask any question for simplified breakdowns, key formulas, and GATE PYQ solutions.\n• **Flashcards Deck**: Interactive 3D memory cards for spaced repetition.\n• **Mock Test Generator**: Custom practice tests with real-time timers and instant answer keys.\n• **Reward Shop & Certificates**: Earn tokens for study streaks to unlock profile frames, avatars, and downloadable certificates.`;
            keyTakeaways = ['AI-Powered Learning', '3 Visual Experience Modes', 'Interactive Flashcards & Mock Tests', 'Reward Shop & Certificates'];
        } else if (qLower.startsWith('hi') || qLower.startsWith('hello') || qLower.startsWith('hey') || qLower === 'hi' || qLower === 'hello') {
            const subjectCtx = contextData.subjectName ? ` in **${contextData.subjectName}**` : '';
            reply = `${contextPrefix}Hello! 👋 How can I help you master **${cleanTopic}**${subjectCtx} today? Feel free to ask me to explain concepts, list key formulas, or provide GATE sample problems!`;
            keyTakeaways = ['Ask for concept explanations', 'Request key formulas', 'Practice sample GATE problems'];
            if (contextData.status === 'fail') keyTakeaways.push('Review this concept');
            else if (contextData.status === 'pass') keyTakeaways.push('Continue to the next topic');
        } else if (qLower.includes('explain') || qLower.includes('simple') || qLower.includes('what is')) {
            reply = `${contextPrefix}Here is an intuitive breakdown of **${cleanTopic}**:\n\n1. **Core Concept**: It forms the mathematical/logical foundation for solving complex engineering equations.\n2. **Why it Matters**: Master this step-by-step so you can apply row operations, matrix transformations, or algorithmic bounds effortlessly.\n3. **Pro Tip**: Break down complicated expressions into elementary matrix steps or base cases.`;
            keyTakeaways = ['Understand fundamental definitions', 'Use elementary steps', 'Practice sample problems'];
        } else if (qLower.includes('formula') || qLower.includes('equation')) {
            reply = `Key Formulas for **${cleanTopic}**:\n\n• **Determinant Property**: det(AB) = det(A) · det(B)\n• **Eigenvalue Relation**: Trace(A) = sum of eigenvalues, det(A) = product of eigenvalues\n• **Rank-Nullity Theorem**: Rank(A) + Nullity(A) = n`;
            keyTakeaways = ['Remember Trace = sum of eigenvalues', 'Determinant = product of eigenvalues', 'Check rank before solving systems'];
        } else if (qLower.includes('example') || qLower.includes('problem') || qLower.includes('gate') || qLower.includes('test me')) {
            reply = `Here is a GATE-style sample problem for **${cleanTopic}**:\n\n**Question**: If a matrix A (3x3) has eigenvalues 1, 2, 3, what is the determinant of (A² + 2I)?\n\n**Solution**:\nEigenvalues of (A² + 2I) are 1² + 2 = 3, 2² + 2 = 6, and 3² + 2 = 11.\nTherefore, det(A² + 2I) = 3 × 6 × 11 = 198.`;
            keyTakeaways = ['Apply spectral mapping theorem', 'Compute transformed eigenvalues', 'Product gives determinant'];
        } else if (qLower.includes('mistake') || qLower.includes('wrong')) {
            reply = `Let's look at common mistakes in **${cleanTopic}**.\n\nA frequent error is ignoring the initial constraint conditions or matrix dimensions. When answering practice questions, I won't just give you the final answer immediately—I'll guide you to recognize these edge cases so you learn to spot them yourself!`;
            keyTakeaways = ['Check constraints', 'Identify edge cases', 'Try 3 practice questions'];
        } else {
            reply = `${contextPrefix}Great question regarding **${cleanTopic}**!\n\nWhen working through "${query}", ensure you check constraint conditions, matrix dimensions, and edge cases. Practicing 3-5 GATE PYQs on this exact topic will make your problem-solving 2x faster!`;
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
