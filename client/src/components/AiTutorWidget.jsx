import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Send, Sparkles, BookOpen, HelpCircle, Check, Copy } from 'lucide-react';
import apiClient from '../api/apiClient';

function qLowerContains(str, keywords) {
    return keywords.some(k => str.includes(k));
}

function getSmartFallbackReply(query, contextData = {}) {
    const cleanTopic = contextData.topicName || 'Engineering Mathematics & Computer Science';
    const qLower = query.toLowerCase();

    let contextPrefix = '';
    if (contextData.topicName) {
        if (contextData.status === 'fail' || (contextData.weakAreas && contextData.weakAreas.length > 0)) {
            contextPrefix = `Based on your recent performance, I notice you might be struggling with **${cleanTopic}**. Let's break it down to strengthen this weak area.\n\n`;
        } else if (contextData.status === 'pass') {
            contextPrefix = `Great job mastering **${cleanTopic}** so far! Let's keep exploring.\n\n`;
        }
    }

    if (qLower.includes('platform') || qLower.includes('daz') || qLower.includes('about this') || qLower.includes('what is this')) {
        return {
            text: `Welcome to **DAZ Learning**! 🚀\n\nDAZ Learning is an AI-powered learning platform designed for Grade 12 & GATE Engineering Mathematics and Computer Science.\n\n**Platform Highlights**:\n• **3 Visual Modes**: Switch between Professional 💼, Gamified 🎮, and Cinematic 🎬 experiences anytime on your Dashboard.\n• **AI Study Assistant**: Ask any question for simplified breakdowns, key formulas, and GATE PYQ solutions.\n• **Flashcards Deck**: Interactive 3D memory cards for spaced repetition.\n• **Mock Test Generator**: Custom practice tests with real-time timers and instant answer keys.\n• **Reward Shop & Certificates**: Earn tokens for study streaks to unlock profile frames, avatars, and downloadable certificates.`,
            keyTakeaways: ['AI-Powered Learning', '3 Visual Experience Modes', 'Interactive Flashcards & Mock Tests', 'Reward Shop & Certificates']
        };
    } else if (qLower.startsWith('hi') || qLower.startsWith('hello') || qLower.startsWith('hey') || qLower.includes('hii') || qLower === 'hi' || qLower === 'hello') {
        const subjectCtx = contextData.subjectName ? ` in **${contextData.subjectName}**` : '';
        const tk = ['Ask for concept explanations', 'Request key formulas', 'Practice sample GATE problems'];
        if (contextData.status === 'fail') tk.push('Review this concept');
        else if (contextData.status === 'pass') tk.push('Continue to the next topic');
        
        return {
            text: `${contextPrefix}Hello! 👋 How can I help you master **${cleanTopic}**${subjectCtx} today? Feel free to ask me to explain concepts, list key formulas, or provide GATE sample problems!`,
            keyTakeaways: tk
        };
    } else if (qLower.includes('explain') || qLower.includes('simple') || qLower.includes('what is')) {
        return {
            text: `${contextPrefix}Here is an intuitive breakdown of **${cleanTopic}**:\n\n1. **Core Concept**: It forms the mathematical foundation for engineering & system analysis.\n2. **Key Property**: Work step-by-step to compute determinants, ranks, or row operations.\n3. **Pro Tip**: Always check constraint conditions and matrix dimensions first!`,
            keyTakeaways: ['Understand fundamental definitions', 'Work step-by-step', 'Verify constraint conditions']
        };
    } else if (qLower.includes('formula') || qLower.includes('equation')) {
        return {
            text: `Key Formulas for **${cleanTopic}**:\n\n• **Determinant Product**: det(A × B) = det(A) × det(B)\n• **Trace & Eigenvalues**: Trace(A) = sum of eigenvalues, det(A) = product of eigenvalues\n• **Rank-Nullity Theorem**: Rank(A) + Nullity(A) = n`,
            keyTakeaways: ['Trace = sum of eigenvalues', 'Determinant = product of eigenvalues', 'Rank + Nullity = columns']
        };
    } else if (qLower.includes('example') || qLower.includes('problem') || qLower.includes('gate') || qLower.includes('test me')) {
        return {
            text: `Here is a GATE PYQ problem for **${cleanTopic}**:\n\n**Question**: If matrix A (3×3) has eigenvalues 1, 2, 3, what is det(A² + 2I)?\n\n**Solution**:\nEigenvalues of (A² + 2I) are 1² + 2 = 3, 2² + 2 = 6, and 3² + 2 = 11.\nDeterminant = 3 × 6 × 11 = 198.`,
            keyTakeaways: ['Apply spectral mapping theorem', 'Compute transformed eigenvalues', 'Product gives determinant']
        };
    } else if (qLower.includes('mistake') || qLower.includes('wrong')) {
        return {
            text: `Let's look at common mistakes in **${cleanTopic}**.\n\nA frequent error is ignoring the initial constraint conditions or matrix dimensions. When answering practice questions, I won't just give you the final answer immediately—I'll guide you to recognize these edge cases so you learn to spot them yourself!`,
            keyTakeaways: ['Check constraints', 'Identify edge cases', 'Try 3 practice questions']
        };
    } else {
        return {
            text: `${contextPrefix}Great question regarding **${cleanTopic}**!\n\nWhen solving "${query}", ensure you check matrix rank, constraint conditions, and edge cases. Practicing 3-5 GATE PYQs on this exact topic will make your problem-solving 2x faster!`,
            keyTakeaways: ['Verify matrix dimensions', 'Apply standard theorems', 'Practice sample GATE problems']
        };
    }
}

const AiTutorWidget = ({ topicName = 'Linear Algebra', contextData = {} }) => {
    // If topicName is provided directly via props, merge it into contextData for legacy support
    const effectiveContext = { topicName, ...contextData };
    const displayTopic = effectiveContext.topicName || 'General Knowledge';

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: `Hi! I'm your AI Study Assistant. Asking anything about **${displayTopic}** or click a quick prompt below!`,
            keyTakeaways: ['Ask for simplified explanations', 'Request key formulas', 'Get GATE PYQ examples']
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText || queryText.trim() === '' || loading) return;

        const userMsg = { sender: 'user', text: queryText };
        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setLoading(true);

        const qClean = queryText.toLowerCase().trim();

        // Check if query is a greeting or general platform question to respond instantly
        const isGreetingOrPlatform =
            qClean === 'hi' || qClean === 'hii' || qClean === 'hello' || qClean === 'hey' ||
            qClean.startsWith('hi ') || qClean.startsWith('hii ') || qClean.startsWith('hello ') ||
            qClean.includes('platform') || qClean.includes('daz') || qLowerContains(qClean, ['about this', 'what is this']);

        if (isGreetingOrPlatform) {
            setTimeout(() => {
                const smartRes = getSmartFallbackReply(queryText, effectiveContext);
                setMessages(prev => [
                    ...prev,
                    { sender: 'ai', text: smartRes.text, keyTakeaways: smartRes.keyTakeaways }
                ]);
                setLoading(false);
            }, 300);
            return;
        }

        try {
            const res = await apiClient.post('/api/ai/tutor', {
                query: queryText,
                topicContext: displayTopic,
                contextData: effectiveContext
            });

            const aiMsg = {
                sender: 'ai',
                text: res.data.reply,
                keyTakeaways: res.data.keyTakeaways || []
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.warn('AI Tutor endpoint pending or network offline, using smart tutor response engine:', err);
            const fallback = getSmartFallbackReply(queryText, effectiveContext);
            setMessages(prev => [
                ...prev,
                { sender: 'ai', text: fallback.text, keyTakeaways: fallback.keyTakeaways }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const promptChips = [
        { label: 'Explain simply 💡', query: `Explain ${displayTopic} in simple terms` },
        { label: 'Key formulas 📐', query: `What are the key formulas for ${displayTopic}?` },
        { label: 'GATE Example 🎯', query: `Give me a GATE PYQ problem for ${displayTopic}` },
    ];

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(v => !v)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 8888,
                    background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                    color: '#ffffff', border: 'none', borderRadius: '9999px',
                    padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    boxShadow: '0 10px 30px rgba(37,99,235,0.4)', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.92rem'
                }}
            >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Brain size={22} />
                    <span style={{
                        position: 'absolute', top: -3, right: -3, width: 8, height: 8,
                        borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e'
                    }} />
                </div>
                <span>{isOpen ? 'Close AI' : 'AI Tutor'}</span>
            </motion.button>

            {/* Chat Drawer Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed', bottom: '5.5rem', right: '2rem', zIndex: 8889,
                            width: 'min(400px, 90vw)', height: '520px',
                            background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '1.25rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(30,41,59,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={16} color="#fff" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem', lineHeight: 1.2 }}>
                                        AI Tutor
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        Currently learning: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{displayTopic}</span>
                                    </div>
                                    {effectiveContext.weakAreas && effectiveContext.weakAreas.length > 0 && (
                                        <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '2px', fontWeight: 600 }}>
                                            Focus area: {effectiveContext.weakAreas[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Prompt Chips */}
                        <div style={{ padding: '0.65rem 1rem', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
                            {promptChips.map((chip, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(chip.query)}
                                    disabled={loading}
                                    style={{
                                        padding: '0.3rem 0.65rem', borderRadius: '999px',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 600,
                                        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s'
                                    }}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        {/* Messages List */}
                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                    }}
                                >
                                    <div style={{
                                        padding: '0.75rem 1rem', borderRadius: msg.sender === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                                        background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(30,41,59,0.9)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                        color: '#ffffff', fontSize: '0.88rem', lineHeight: 1.5, position: 'relative'
                                    }}>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                                        {/* Key Takeaways Pills */}
                                        {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                                            <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Key Points:</span>
                                                {msg.keyTakeaways.map((point, pIdx) => (
                                                    <span key={pIdx} style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                        ✓ {point}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Copy Button */}
                                    {msg.sender === 'ai' && (
                                        <button
                                            onClick={() => handleCopy(msg.text, idx)}
                                            style={{
                                                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                                                fontSize: '0.7rem', marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                                            }}
                                        >
                                            {copiedIndex === idx ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                                            {copiedIndex === idx ? 'Copied' : 'Copy'}
                                        </button>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div style={{ alignSelf: 'flex-start', padding: '0.6rem 1rem', borderRadius: '1rem', background: 'rgba(30,41,59,0.9)', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={14} className="spin" /> AI is thinking…
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(30,41,59,0.8)', display: 'flex', gap: '0.5rem' }}
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={`Ask about ${displayTopic}...`}
                                disabled={loading}
                                style={{
                                    flex: 1, padding: '0.6rem 0.85rem', borderRadius: '0.5rem',
                                    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)',
                                    color: '#ffffff', fontSize: '0.88rem', margin: 0
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                style={{
                                    padding: '0.6rem 0.9rem', borderRadius: '0.5rem',
                                    background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', border: 'none',
                                    color: '#ffffff', cursor: loading || !input.trim() ? 'default' : 'pointer',
                                    opacity: loading || !input.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AiTutorWidget;
