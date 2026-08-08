import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, CheckCircle2, AlertCircle, HelpCircle, Award, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

const DEFAULT_CARDS = [
    {
        id: 1,
        concept: 'Determinant Product Property',
        front: 'What is the determinant of the product of two matrices, det(A × B)?',
        back: 'det(A × B) = det(A) × det(B). The determinant of a matrix product equals the product of their individual determinants.',
        difficulty: 'Easy',
        tag: 'Linear Algebra'
    },
    {
        id: 2,
        concept: 'Eigenvalue Sum & Product Theorems',
        front: 'How do the Trace and Determinant of a matrix relate to its Eigenvalues λ₁, λ₂, ..., λₙ?',
        back: 'Sum of Eigenvalues = Trace(A)\nProduct of Eigenvalues = det(A)',
        difficulty: 'Medium',
        tag: 'Matrix Theory'
    },
    {
        id: 3,
        concept: 'Rank-Nullity Theorem',
        front: 'State the Rank-Nullity Theorem for a matrix A (size m × n).',
        back: 'Rank(A) + Nullity(A) = n (number of columns in A).',
        difficulty: 'Hard',
        tag: 'Vector Spaces'
    },
    {
        id: 4,
        concept: 'Inverse Matrix Condition',
        front: 'When does a square matrix A have an inverse A⁻¹?',
        back: 'A matrix A is invertible if and only if det(A) ≠ 0 (i.e. A is non-singular and has full rank).',
        difficulty: 'Easy',
        tag: 'Linear Algebra'
    }
];

const FlashcardDeck = ({ cards = DEFAULT_CARDS, topicName = 'Linear Algebra' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [masteredIds, setMasteredIds] = useState([]);

    const currentCard = cards[currentIndex] || cards[0];
    const isMastered = masteredIds.includes(currentCard.id);

    const handleFlip = () => setIsFlipped(v => !v);

    const handleRate = (mastered) => {
        if (mastered && !isMastered) {
            setMasteredIds(prev => [...prev, currentCard.id]);
        } else if (!mastered && isMastered) {
            setMasteredIds(prev => prev.filter(id => id !== currentCard.id));
        }

        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setCurrentIndex(0);
            }
        }, 200);
    };

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((currentIndex + 1) % cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);
    };

    const masteredCount = masteredIds.length;
    const progressPct = Math.round((masteredCount / cards.length) * 100);

    return (
        <div className="glass-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(124,58,237,0.15)', color: '#a855f7' }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text)' }}>Flashcards & Memory Deck</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{topicName} · Spaced Repetition</span>
                    </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '4px 12px', borderRadius: '99px' }}>
                    Card {currentIndex + 1} of {cards.length}
                </div>
            </div>

            {/* 3D Flip Card Container */}
            <div
                onClick={handleFlip}
                style={{
                    perspective: '1000px', cursor: 'pointer', minHeight: '220px',
                    marginBottom: '1.5rem', position: 'relative'
                }}
            >
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{
                        width: '100%', minHeight: '220px', borderRadius: '1rem',
                        transformStyle: 'preserve-3d', position: 'relative'
                    }}
                >
                    {/* Front Face */}
                    <div style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        borderRadius: '1rem', padding: '1.75rem',
                        background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', background: 'rgba(168,85,247,0.15)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                {currentCard.tag || 'Concept'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <RotateCw size={12} /> Click to Flip
                            </span>
                        </div>

                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.5, textCenter: 'center', margin: '1rem 0' }}>
                            {currentCard.front}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                            💡 Flip to view explanation & formulas
                        </div>
                    </div>

                    {/* Back Face */}
                    <div style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: '1rem', padding: '1.75rem',
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,58,138,0.4))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                                Answer / Explanation
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {currentCard.concept}
                            </span>
                        </div>

                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: '0.75rem 0' }}>
                            {currentCard.back}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                            ✓ Rating helps tune spaced repetition
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Controls & Rating Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                    onClick={handlePrev}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                >
                    <ChevronLeft size={16} /> Prev
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleRate(false)}
                        style={{ padding: '0.45rem 0.9rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Review Again 🔴
                    </button>
                    <button
                        onClick={() => handleRate(true)}
                        style={{ padding: '0.45rem 0.9rem', borderRadius: '0.5rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Mastered 🟢
                    </button>
                </div>

                <button
                    onClick={handleNext}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>

            {/* Deck Progress Bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Deck Mastery</span>
                    <span style={{ fontWeight: 700, color: '#22c55e' }}>{masteredCount} of {cards.length} ({progressPct}%)</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #10b981)', transition: 'width 0.4s ease' }} />
                </div>
            </div>
        </div>
    );
};

export default FlashcardDeck;
