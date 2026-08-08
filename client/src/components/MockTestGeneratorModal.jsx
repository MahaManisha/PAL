import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, HelpCircle, Target, Award, CheckCircle2, ShieldAlert, Flag, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

const SAMPLE_GENERATED_QUESTIONS = [
    {
        id: 'mock_1',
        topic: 'Linear Algebra',
        questionText: 'Let A be a 3×3 matrix with determinant det(A) = 5. What is det(3A)?',
        options: ['15', '45', '135', '5'],
        correctAnswer: 2,
        explanation: 'For an n×n matrix A, det(kA) = kⁿ det(A). Here n=3, k=3, so det(3A) = 3³ × det(A) = 27 × 5 = 135.'
    },
    {
        id: 'mock_2',
        topic: 'Eigenvalues',
        questionText: 'If λ is an eigenvalue of an invertible matrix A, what is the eigenvalue of A⁻¹?',
        options: ['-λ', '1/λ', 'λ²', '1 - λ'],
        correctAnswer: 1,
        explanation: 'If A v = λ v, then A⁻¹ A v = A⁻¹ λ v => v = λ A⁻¹ v => A⁻¹ v = (1/λ) v.'
    },
    {
        id: 'mock_3',
        topic: 'System of Linear Equations',
        questionText: 'A system of homogeneous linear equations Ax = 0 has a non-trivial solution if and only if:',
        options: ['det(A) ≠ 0', 'Rank(A) = n', 'det(A) = 0', 'A is identity matrix'],
        correctAnswer: 2,
        explanation: 'Homogeneous systems Ax = 0 have non-trivial (non-zero) solutions if and only if det(A) = 0 (rank < n).'
    },
    {
        id: 'mock_4',
        topic: 'Matrix Properties',
        questionText: 'What is the sum of eigenvalues of a matrix equal to?',
        options: ['Determinant', 'Trace', 'Rank', 'Nullity'],
        correctAnswer: 1,
        explanation: 'The sum of the diagonal elements of a matrix is called its Trace, and Trace(A) = Σ λ_i.'
    },
    {
        id: 'mock_5',
        topic: 'Vector Spaces',
        questionText: 'If the rank of a 4×5 matrix A is 3, what is the nullity of A?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        explanation: 'By the Rank-Nullity theorem: Rank(A) + Nullity(A) = number of columns (n=5). So 3 + Nullity = 5 => Nullity = 2.'
    }
];

const MockTestGeneratorModal = ({ isOpen, onClose, topicName = 'Linear Algebra' }) => {
    const [step, setStep] = useState('config'); // 'config' | 'test' | 'result'

    // Config state
    const [numQuestions, setNumQuestions] = useState(5);
    const [timerMinutes, setTimerMinutes] = useState(10);
    const [difficulty, setDifficulty] = useState('GATE Hard');

    // Test state
    const [questions, setQuestions] = useState(SAMPLE_GENERATED_QUESTIONS);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(600);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (step === 'test' && secondsLeft > 0 && !isSubmitted) {
            const timer = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, secondsLeft, isSubmitted]);

    const handleStartTest = () => {
        setAnswers({});
        setFlagged({});
        setCurrentIdx(0);
        setSecondsLeft(timerMinutes * 60);
        setIsSubmitted(false);
        setStep('test');
    };

    const handleSelectAnswer = (qIdx, optionIdx) => {
        setAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
    };

    const handleToggleFlag = (qIdx) => {
        setFlagged(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
    };

    const handleSubmitTest = () => {
        setIsSubmitted(true);
        setStep('result');
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        return {
            correct,
            total: questions.length,
            pct: Math.round((correct / questions.length) * 100)
        };
    };

    if (!isOpen) return null;

    const formatTime = (totalSec) => {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const scoreInfo = calculateScore();

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9400,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                overflowY: 'auto'
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%', maxWidth: '780px', background: '#0f172a',
                        borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem 1.75rem', background: 'rgba(30,41,59,0.8)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Target size={22} color="#3b82f6" />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800 }}>
                                    Mock Test Generator
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                    {topicName} · Custom GATE Practice
                                </span>
                            </div>
                        </div>

                        {step === 'test' && (
                            <div style={{
                                padding: '0.4rem 0.85rem', borderRadius: '99px',
                                background: secondsLeft < 120 ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.15)',
                                border: secondsLeft < 120 ? '1px solid #ef4444' : '1px solid #3b82f6',
                                color: secondsLeft < 120 ? '#ef4444' : '#60a5fa',
                                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}>
                                <Clock size={16} /> {formatTime(secondsLeft)}
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Step 1: Configuration */}
                    {step === 'config' && (
                        <div style={{ padding: '2rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.5rem' }}>
                                Configure Your Mock Test Parameters
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                {/* Questions count */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        Number of Questions
                                    </label>
                                    <select
                                        value={numQuestions}
                                        onChange={e => setNumQuestions(Number(e.target.value))}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.95rem' }}
                                    >
                                        <option value={5}>5 Questions (Quick)</option>
                                        <option value={10}>10 Questions (Standard)</option>
                                        <option value={15}>15 Questions (Full Set)</option>
                                    </select>
                                </div>

                                {/* Timer */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        Time Limit
                                    </label>
                                    <select
                                        value={timerMinutes}
                                        onChange={e => setTimerMinutes(Number(e.target.value))}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.95rem' }}
                                    >
                                        <option value={5}>5 Minutes</option>
                                        <option value={10}>10 Minutes</option>
                                        <option value={20}>20 Minutes</option>
                                    </select>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={e => setDifficulty(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.95rem' }}
                                    >
                                        <option value="GATE Hard">🔬 GATE Hard</option>
                                        <option value="Balanced">⚖️ Balanced</option>
                                        <option value="Fundamentals">📘 Fundamentals</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleStartTest}
                                    className="btn btn-primary"
                                    style={{ padding: '0.85rem 2.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    🚀 Start Practice Test
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Test Mode */}
                    {step === 'test' && (
                        <div style={{ padding: '2rem' }}>
                            {/* Question Nav Pills */}
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {questions.map((q, i) => {
                                    const isAnswered = answers[i] !== undefined;
                                    const isFlagged = flagged[i];
                                    const isCurrent = i === currentIdx;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIdx(i)}
                                            style={{
                                                width: 32, height: 32, borderRadius: '0.4rem',
                                                background: isCurrent ? '#2563eb' : isAnswered ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                                                border: isFlagged ? '2px solid #ef4444' : isCurrent ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                                                color: '#ffffff', fontWeight: 700, fontSize: '0.82rem',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Question Card */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Question {currentIdx + 1} of {questions.length}
                                    </span>
                                    <button
                                        onClick={() => handleToggleFlag(currentIdx)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: flagged[currentIdx] ? '#ef4444' : '#64748b',
                                            fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem'
                                        }}
                                    >
                                        <Flag size={14} /> {flagged[currentIdx] ? 'Flagged' : 'Flag for Review'}
                                    </button>
                                </div>

                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                                    {questions[currentIdx].questionText}
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {questions[currentIdx].options.map((opt, oIdx) => {
                                        const isSelected = answers[currentIdx] === oIdx;
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleSelectAnswer(currentIdx, oIdx)}
                                                style={{
                                                    padding: '0.85rem 1.1rem', borderRadius: '0.65rem',
                                                    textAlign: 'left', cursor: 'pointer',
                                                    background: isSelected ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.03)',
                                                    border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                    color: isSelected ? '#ffffff' : '#cbd5e1', fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontWeight: 700, marginRight: '0.5rem', color: isSelected ? '#60a5fa' : '#94a3b8' }}>
                                                    {String.fromCharCode(65 + oIdx)}.
                                                </span>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Nav Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    disabled={currentIdx === 0}
                                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                    style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: currentIdx === 0 ? 'default' : 'pointer', opacity: currentIdx === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                <button
                                    onClick={handleSubmitTest}
                                    style={{ padding: '0.6rem 1.5rem', borderRadius: '99px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Submit Test
                                </button>

                                <button
                                    disabled={currentIdx === questions.length - 1}
                                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                                    style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: currentIdx === questions.length - 1 ? 'default' : 'pointer', opacity: currentIdx === questions.length - 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Result Mode */}
                    {step === 'result' && (
                        <div style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: scoreInfo.pct >= 70 ? '#4ade80' : '#fbbf24', marginBottom: '0.25rem' }}>
                                    {scoreInfo.pct}%
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                                    {scoreInfo.pct >= 70 ? '🎉 Great Job! Test Passed' : '💪 Keep Practicing!'}
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    You scored {scoreInfo.correct} out of {scoreInfo.total} questions correctly.
                                </p>
                            </div>

                            {/* Answer Key Breakdown */}
                            <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                                Detailed Answer Review:
                            </h5>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {questions.map((q, i) => {
                                    const userAns = answers[i];
                                    const isCorrect = userAns === q.correctAnswer;
                                    return (
                                        <div key={i} style={{ padding: '1.1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: isCorrect ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                                                    Q{i + 1}. {q.questionText}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCorrect ? '#4ade80' : '#ef4444' }}>
                                                    {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                                Your answer: <strong style={{ color: isCorrect ? '#4ade80' : '#ef4444' }}>{userAns !== undefined ? q.options[userAns] : 'Not Answered'}</strong>
                                                {!isCorrect && <span> | Correct answer: <strong style={{ color: '#4ade80' }}>{q.options[q.correctAnswer]}</strong></span>}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', lineHeight: 1.5 }}>
                                                💡 <strong>Explanation</strong>: {q.explanation}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={handleStartTest}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <RotateCcw size={16} /> Retake Test
                                </button>
                                <button
                                    onClick={onClose}
                                    className="btn btn-primary"
                                    style={{ padding: '0.75rem 2rem', borderRadius: '99px', fontWeight: 700 }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MockTestGeneratorModal;
