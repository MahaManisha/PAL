import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, Zap, Target, ArrowLeft, Clock, Play, Pause, RefreshCw, 
    CheckCircle, XCircle, ChevronRight, Award, MessageSquare 
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import AiTutorWidget from '../components/AiTutorWidget';
import AchievementUnlockModal from '../components/AchievementUnlockModal';

const MAX_PRACTICE_QUESTIONS = 5; // shorter focused session

const FocusSession = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, updateUserStats } = useContext(AuthContext);

    // Context from AI Coach Insight
    const insight = location.state?.insight || null;
    const sessionLoggedRef = useRef(false);

    // Session State Machine
    // intro -> review -> practice -> mistake_review -> summary
    const [step, setStep] = useState('intro');

    // Data State
    const [topicDetails, setTopicDetails] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [practiceData, setPracticeData] = useState(null);

    // Timer State (15 min default = 900 seconds)
    const [timeLeft, setTimeLeft] = useState(900);
    const [timerActive, setTimerActive] = useState(false);

    // Practice State
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [mistakes, setMistakes] = useState([]);

    // Final Summary State
    const [summaryData, setSummaryData] = useState(null);
    const [newlyUnlocked, setNewlyUnlocked] = useState([]);

    // AI Context State
    const [aiContext, setAiContext] = useState({
        topicName: insight?.contextTag || insight?.title || 'General Study',
        status: insight?.type || 'in_progress',
        weakAreas: insight?.type === 'REMEDIATION' && insight?.contextTag ? [insight.contextTag] : []
    });

    useEffect(() => {
        if (!insight || !user) {
            navigate('/dashboard');
        } else {
            // Pre-fetch topic details and practice session data
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    // Extract topicId from signature, assuming format TYPE:topicId
                    const parts = (insight.signature || '').split(':');
                    const topicId = parts.length > 1 ? parts[1] : null;

                    if (topicId) {
                        const [topicRes, practiceRes] = await Promise.all([
                            apiClient.get(`/api/topics/detail/${topicId}`),
                            apiClient.get(`/api/practice/session/${topicId}`).catch(() => ({ data: { questions: [] } }))
                        ]);
                        setTopicDetails(topicRes.data.topic);
                        
                        // Pick subset of questions for focused session
                        let allQ = practiceRes.data.questions || [];
                        // shuffle and pick max
                        allQ = allQ.sort(() => 0.5 - Math.random()).slice(0, MAX_PRACTICE_QUESTIONS);
                        setQuestions(allQ);
                    }
                } catch (err) {
                    console.error("Failed to load session data", err);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [insight, user, navigate]);

    // Timer countdown effect
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft <= 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleTimer = () => setTimerActive(!timerActive);

    // Handlers
    const startReview = () => {
        setStep('review');
        setTimerActive(true);
        setAiContext(prev => ({ ...prev, currentStep: 'Quick Review', topicDetails: topicDetails?.content || '' }));
    };

    const startPractice = () => {
        if (questions.length === 0) {
            endSession(); // no questions available, skip to summary
        } else {
            setStep('practice');
            setAiContext(prev => ({ ...prev, currentStep: 'Practice Mode' }));
        }
    };

    const submitAnswer = () => {
        if (selectedOption === null || isAnswered) return;
        const currentQ = questions[currentQuestionIndex];
        const correct = selectedOption === currentQ.correctAnswer;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (correct) {
            setCorrectCount(prev => prev + 1);
        } else {
            setMistakes(prev => [...prev, {
                questionText: currentQ.questionText,
                selectedOption,
                correctOption: currentQ.correctAnswer,
                questionId: currentQ.id
            }]);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex + 1 >= questions.length) {
            if (mistakes.length > 0) {
                setStep('mistake_review');
                setAiContext(prev => ({ ...prev, currentStep: 'Mistake Review', recentMistakes: mistakes }));
            } else {
                endSession();
            }
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setIsCorrect(false);
        }
    };

    const endSession = async () => {
        setStep('loading_summary');
        setTimerActive(false);
        try {
            const parts = (insight.signature || '').split(':');
            const topicId = parts.length > 1 ? parts[1] : null;

            if (topicId) {
                const res = await apiClient.post('/api/practice/submit', {
                    userId: user.id,
                    topicId,
                    correctCount,
                    totalQuestions: questions.length,
                    mistakes: mistakes.map(m => ({ questionId: m.questionId, selectedOption: m.selectedOption, correctOption: m.correctOption }))
                });

                if (res.data.userStats) updateUserStats(res.data.userStats);
                if (res.data.newlyUnlockedAchievements?.length > 0) setNewlyUnlocked(res.data.newlyUnlockedAchievements);

                setSummaryData(res.data);

                // Log the Focus Session History securely once
                if (!sessionLoggedRef.current) {
                    sessionLoggedRef.current = true;
                    try {
                        const durationSeconds = 900 - timeLeft;
                        const accuracy = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
                        await apiClient.post('/api/sessions/log', {
                            topicId,
                            topicName: topicDetails?.topicName || insight?.title || 'Unknown Topic',
                            subjectName: insight?.contextTag || 'Study',
                            durationSeconds: durationSeconds > 0 ? durationSeconds : 0,
                            questionsAttempted: questions.length,
                            correctAnswers: correctCount,
                            accuracy,
                            xpEarned: res.data.xpEarned || 15,
                            mistakes: mistakes.map(m => ({ questionText: m.questionText, selectedOption: m.selectedOption, correctOption: m.correctOption }))
                        });
                    } catch (logErr) {
                        console.error('Failed to log session history', logErr);
                    }
                }
            }
            setStep('summary');
        } catch (err) {
            console.error("Failed to end session", err);
            setStep('summary'); // show generic summary if fail
        }
    };

    const handleAskTutor = () => {
        const tutorBtn = document.querySelector('.ai-tutor-toggle');
        if (tutorBtn) tutorBtn.click();
    };

    if (!insight) return null;

    const renderTimer = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid var(--card-border)' }}>
            <Clock size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timeLeft <= 60 ? '#ef4444' : 'var(--text)' }}>
                {formatTime(timeLeft)}
            </span>
            <button onClick={toggleTimer} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                {timerActive ? <Pause size={14} /> : <Play size={14} />}
            </button>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <AchievementUnlockModal achievements={newlyUnlocked} onClose={() => setNewlyUnlocked([])} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={24} /></Link>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Focus Session</h1>
                </div>
                {step !== 'intro' && step !== 'summary' && step !== 'loading_summary' && renderTimer()}
            </div>

            {loadingData && step === 'intro' ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                    <p>Preparing your guided session...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {/* STEP 1: INTRO */}
                    {step === 'intro' && (
                        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                                    <Target size={40} />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{insight.title}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>{insight.message}</p>

                                <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Session Plan</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}><CheckCircle size={18} color="var(--primary)"/> Quick Review (approx. 5m)</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}><CheckCircle size={18} color="var(--primary)"/> Targeted Practice ({questions.length} questions)</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}><CheckCircle size={18} color="var(--primary)"/> Mistake Review & Insights</li>
                                    </ul>
                                </div>

                                <button onClick={startReview} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    Start Session (15m Timer) <ChevronRight size={20} />
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="btn" style={{ width: '100%', padding: '1rem', marginTop: '0.75rem', background: 'transparent', color: 'var(--text-muted)' }}>
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: REVIEW */}
                    {step === 'review' && (
                        <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                        <BookOpen size={20} /> Quick Review
                                    </h3>
                                    <button onClick={handleAskTutor} className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'none' }}>
                                        <MessageSquare size={16}/> Ask AI Tutor
                                    </button>
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>{topicDetails?.topicName || 'Topic Concept'}</h2>
                                <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', lineHeight: 1.7, color: 'var(--text)', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
                                    {topicDetails?.content || 'No specific text content available. Please refer to your notes or ask the AI Tutor for a summary.'}
                                </div>
                                <button onClick={startPractice} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    Ready for Practice <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PRACTICE */}
                    {step === 'practice' && questions[currentQuestionIndex] && (
                        <motion.div key="practice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Targeted Practice</span>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>Question {currentQuestionIndex + 1} of {questions.length}</h2>
                                </div>
                                <button onClick={handleAskTutor} className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'none' }}>
                                    <MessageSquare size={16}/> Help me understand
                                </button>
                            </div>
                            
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '2rem', overflow: 'hidden' }}>
                                <div style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                            </div>

                            <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2rem', color: 'var(--text)' }}>
                                    {questions[currentQuestionIndex].questionText}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {questions[currentQuestionIndex].options.map((opt, i) => {
                                        let border = '1px solid var(--card-border)';
                                        let bg = 'var(--input-bg)';
                                        if (isAnswered) {
                                            if (i === questions[currentQuestionIndex].correctAnswer) { border = '2px solid #22c55e'; bg = 'rgba(34,197,94,0.1)'; }
                                            else if (i === selectedOption) { border = '2px solid #ef4444'; bg = 'rgba(239,68,68,0.1)'; }
                                        } else if (selectedOption === i) {
                                            border = '2px solid var(--primary)'; bg = 'rgba(99,102,241,0.1)';
                                        }
                                        return (
                                            <button key={i} disabled={isAnswered} onClick={() => setSelectedOption(i)} style={{ padding: '1.25rem', textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer', background: bg, border, borderRadius: '0.75rem', color: 'var(--text)', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ flex: 1 }}>{opt}</span>
                                                {isAnswered && i === questions[currentQuestionIndex].correctAnswer && <CheckCircle size={20} color="#22c55e" />}
                                                {isAnswered && i === selectedOption && i !== questions[currentQuestionIndex].correctAnswer && <XCircle size={20} color="#ef4444" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {!isAnswered ? (
                                    <button onClick={submitAnswer} disabled={selectedOption === null} className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 700, opacity: selectedOption === null ? 0.5 : 1 }}>
                                        Submit Answer
                                    </button>
                                ) : (
                                    <div style={{ width: '100%', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isCorrect ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                                            {isCorrect ? <><CheckCircle size={24}/> Good job!</> : <><XCircle size={24}/> Review this mistake later.</>}
                                        </div>
                                        <button onClick={nextQuestion} className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                            {currentQuestionIndex + 1 >= questions.length ? 'Complete Practice' : 'Next Question'} <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: MISTAKE REVIEW */}
                    {step === 'mistake_review' && (
                        <motion.div key="mistake_review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                                        <Zap size={20} /> Mistake Review
                                    </h3>
                                    <button onClick={handleAskTutor} className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none' }}>
                                        <MessageSquare size={16}/> Ask AI to explain
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You made {mistakes.length} mistakes. Let's briefly review them before concluding the session.</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                    {mistakes.map((m, idx) => (
                                        <div key={idx} style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>Q: {m.questionText}</p>
                                            <p style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '0.9rem' }}><XCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }}/> You chose option {m.selectedOption + 1}</p>
                                            <p style={{ color: '#22c55e', margin: 0, fontSize: '0.9rem' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }}/> Correct option: {m.correctOption + 1}</p>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={endSession} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    Finish Session <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'loading_summary' && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                            <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                            <p>Calculating your progress...</p>
                        </div>
                    )}

                    {/* STEP 5: SUMMARY */}
                    {step === 'summary' && (
                        <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                            <div className="glass-card" style={{ padding: '3rem 2rem' }}>
                                <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', color: '#22c55e', marginBottom: '1.5rem' }}>
                                    <Award size={48} />
                                </div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>Focus Session Complete!</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Great job dedicating time to {insight.title}.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                    <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--card-border)' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Accuracy</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: (correctCount / questions.length) >= 0.7 ? '#10b981' : '#f59e0b' }}>
                                            {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{correctCount} / {questions.length} Correct</div>
                                    </div>
                                    <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--card-border)' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>XP Earned</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                            <Zap size={24} fill="var(--primary)" /> +{summaryData?.xpEarned || 15}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Session reward</div>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                    Back to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* AI Tutor Floating Widget with Session Context */}
            <AiTutorWidget contextData={aiContext} />
        </div>
    );
};

export default FocusSession;
