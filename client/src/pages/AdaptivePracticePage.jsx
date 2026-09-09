import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Target, Star, CheckCircle, XCircle, ChevronRight, Award, RefreshCw, BarChart2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AchievementUnlockModal from '../components/AchievementUnlockModal';
import { useNextAction } from '../hooks/useNextAction';

const MAX_QUESTIONS_PER_SESSION = 10;

const AdaptivePracticePage = () => {
    const { user, updateUserStats } = useContext(AuthContext);
    const { themeConfig, experience } = useTheme();
    const navigate = useNavigate();

    const [loadingSetup, setLoadingSetup] = useState(true);
    const { nextAction, isLoading: isLoadingNextAction } = useNextAction();
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [allTopics, setAllTopics] = useState([]);
    
    // Session States
    const [sessionStatus, setSessionStatus] = useState('setup'); // setup, active, loading_session, summary
    const [questions, setQuestions] = useState({ easy: [], medium: [], hard: [] });
    const [askedQuestionIds, setAskedQuestionIds] = useState(new Set());
    const [currentDifficulty, setCurrentDifficulty] = useState('easy');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    
    // Answer States
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    
    // Progress Tracking
    const [correctCount, setCorrectCount] = useState(0);
    const [mistakes, setMistakes] = useState([]);
    const [startingDifficulty, setStartingDifficulty] = useState('easy');
    const [summaryData, setSummaryData] = useState(null);
    const [newlyUnlocked, setNewlyUnlocked] = useState([]);

    // 1. Initial Load: Get Topics and Sync Recommendation
    useEffect(() => {
        if (!user || !user.id) return;
        const fetchTopics = async () => {
            setLoadingSetup(true);
            try {
                const topicsRes = await apiClient.get('/api/topics');
                if (Array.isArray(topicsRes.data)) {
                    setAllTopics(topicsRes.data);
                } else if (topicsRes.data && Array.isArray(topicsRes.data.data)) {
                     setAllTopics(topicsRes.data.data);
                }
            } catch (err) {
                console.error("Failed to load topics", err);
            } finally {
                setLoadingSetup(false);
            }
        };
        fetchTopics();
    }, [user]);

    useEffect(() => {
        if (!isLoadingNextAction && nextAction?.topicId) {
            setSelectedTopicId(nextAction.topicId);
        }
    }, [nextAction, isLoadingNextAction]);

    // 2. Start Session
    const startSession = async () => {
        if (!selectedTopicId) return;
        setSessionStatus('loading_session');
        try {
            const res = await apiClient.get(`/api/practice/session/${selectedTopicId}`);
            const qList = res.data.questions || [];
            
            // Organize into buckets
            const buckets = { easy: [], medium: [], hard: [] };
            qList.forEach(q => {
                if (buckets[q.difficulty]) {
                    buckets[q.difficulty].push(q);
                } else {
                    buckets.medium.push(q);
                }
            });

            setQuestions(buckets);
            setStartingDifficulty('easy');
            setCurrentDifficulty('easy');
            setQuestionNumber(1);
            setCorrectCount(0);
            setMistakes([]);
            setAskedQuestionIds(new Set());
            
            pickNextQuestion('easy', buckets, new Set());
            setSessionStatus('active');

        } catch (err) {
            console.error("Failed to start session", err);
            alert("Could not load practice questions for this topic.");
            setSessionStatus('setup');
        }
    };

    // Helper: Pick a question from a specific bucket, fallback to adjacents if empty
    const pickNextQuestion = (targetDiff, availableBuckets, askedSet) => {
        const getUnasked = (diff) => availableBuckets[diff].filter(q => !askedSet.has(q.id));
        
        let bucket = getUnasked(targetDiff);
        let finalDiff = targetDiff;

        // Fallbacks
        if (bucket.length === 0) {
            if (targetDiff === 'hard') {
                bucket = getUnasked('medium'); finalDiff = 'medium';
                if (bucket.length === 0) { bucket = getUnasked('easy'); finalDiff = 'easy'; }
            } else if (targetDiff === 'medium') {
                bucket = getUnasked('hard'); finalDiff = 'hard';
                if (bucket.length === 0) { bucket = getUnasked('easy'); finalDiff = 'easy'; }
            } else {
                bucket = getUnasked('medium'); finalDiff = 'medium';
                if (bucket.length === 0) { bucket = getUnasked('hard'); finalDiff = 'hard'; }
            }
        }

        if (bucket.length === 0) {
            return null; // Out of questions
        }

        // Random pick from the chosen bucket
        const randomQ = bucket[Math.floor(Math.random() * bucket.length)];
        setCurrentDifficulty(finalDiff);
        setCurrentQuestion(randomQ);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
        return randomQ;
    };

    // 3. Handle Submit Answer
    const submitAnswer = () => {
        if (selectedOption === null || isAnswered) return;
        
        const correct = selectedOption === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (correct) {
            setCorrectCount(prev => prev + 1);
        } else {
            setMistakes(prev => [...prev, {
                questionId: currentQuestion.id,
                selectedOption,
                correctOption: currentQuestion.correctAnswer
            }]);
        }
    };

    // 4. Handle Next Question or End Session
    const handleNext = () => {
        const newAskedSet = new Set(askedQuestionIds);
        newAskedSet.add(currentQuestion.id);
        setAskedQuestionIds(newAskedSet);

        if (questionNumber >= MAX_QUESTIONS_PER_SESSION) {
            endSession(newAskedSet.size);
            return;
        }

        // Determine next difficulty
        let nextDiff = currentDifficulty;
        if (isCorrect) {
            if (currentDifficulty === 'easy') nextDiff = 'medium';
            else if (currentDifficulty === 'medium') nextDiff = 'hard';
        } else {
            if (currentDifficulty === 'hard') nextDiff = 'medium';
            else if (currentDifficulty === 'medium') nextDiff = 'easy';
        }

        const nextQ = pickNextQuestion(nextDiff, questions, newAskedSet);
        if (!nextQ) {
            // Out of questions before MAX
            endSession(newAskedSet.size);
        } else {
            setQuestionNumber(prev => prev + 1);
        }
    };

    // 5. End Session
    const endSession = async (totalAnswered) => {
        setSessionStatus('loading_session');
        try {
            const res = await apiClient.post('/api/practice/submit', {
                userId: user.id,
                topicId: selectedTopicId,
                correctCount,
                totalQuestions: totalAnswered,
                mistakes
            });

            if (res.data.userStats) {
                updateUserStats(res.data.userStats);
            }
            if (res.data.newlyUnlockedAchievements?.length > 0) {
                setNewlyUnlocked(res.data.newlyUnlockedAchievements);
            }

            setSummaryData({
                ...res.data,
                totalAnswered,
                correctCount,
                startingDifficulty,
                finalDifficulty: currentDifficulty
            });
            setSessionStatus('summary');
        } catch (err) {
            console.error("Failed to submit practice session", err);
            setSessionStatus('setup');
        }
    };

    // UI Renders
    if (loadingSetup) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading Adaptive Practice...</div>
            </div>
        );
    }

    const alphabet = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className="container" style={{ paddingTop: '5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <AchievementUnlockModal achievements={newlyUnlocked} onClose={() => setNewlyUnlocked([])} />

            {sessionStatus === 'setup' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={24} /></Link>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Adaptive Practice</h1>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Zap size={24} />
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>AI Recommendation</h2>
                        </div>
                        
                        {nextAction && !isLoadingNextAction ? (
                            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>{nextAction.topicName}</h3>
                                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{nextAction.reason}</p>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>{isLoadingNextAction ? 'Finding the best topic...' : 'Select a topic below to begin.'}</p>
                        )}

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Or choose another topic:</label>
                            <select 
                                value={selectedTopicId} 
                                onChange={(e) => setSelectedTopicId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                            >
                                <option value="" disabled>Select a topic...</option>
                                {allTopics.map(t => (
                                    <option key={t._id} value={t._id}>{t.topicName || t.name || 'Unnamed Topic'}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={startSession} 
                            disabled={!selectedTopicId}
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            Start Practice Session <ChevronRight size={20} />
                        </button>
                    </div>
                </motion.div>
            )}

            {sessionStatus === 'loading_session' && (
                <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>
                    <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                    <p>Preparing your adaptive session...</p>
                </div>
            )}

            {sessionStatus === 'active' && currentQuestion && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Practice Mode
                            </span>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>Question {questionNumber} of {MAX_QUESTIONS_PER_SESSION}</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'capitalize' }}>
                                {currentDifficulty} Level
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '2.5rem', overflow: 'hidden' }}>
                        <div style={{ width: `${(questionNumber / MAX_QUESTIONS_PER_SESSION) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                    </div>

                    {/* Question Card */}
                    <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2rem', color: 'var(--text)' }}>
                            {currentQuestion.questionText}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentQuestion.options.map((opt, i) => {
                                let border = '1px solid var(--card-border)';
                                let bg = 'var(--input-bg)';
                                
                                if (isAnswered) {
                                    if (i === currentQuestion.correctAnswer) {
                                        border = '2px solid #22c55e';
                                        bg = 'rgba(34,197,94,0.1)';
                                    } else if (i === selectedOption) {
                                        border = '2px solid #ef4444';
                                        bg = 'rgba(239,68,68,0.1)';
                                    }
                                } else if (selectedOption === i) {
                                    border = '2px solid var(--primary)';
                                    bg = 'rgba(99,102,241,0.1)';
                                }

                                return (
                                    <button 
                                        key={i} 
                                        disabled={isAnswered}
                                        onClick={() => setSelectedOption(i)}
                                        style={{ 
                                            padding: '1.25rem 1.5rem', textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer',
                                            background: bg, border, borderRadius: '0.75rem', color: 'var(--text)',
                                            fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
                                        }}
                                    >
                                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800 }}>
                                            {alphabet[i]}
                                        </span>
                                        <span style={{ flex: 1 }}>{opt}</span>
                                        
                                        {isAnswered && i === currentQuestion.correctAnswer && <CheckCircle size={20} color="#22c55e" />}
                                        {isAnswered && i === selectedOption && i !== currentQuestion.correctAnswer && <XCircle size={20} color="#ef4444" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {!isAnswered ? (
                            <button 
                                onClick={submitAnswer} 
                                disabled={selectedOption === null}
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 700, opacity: selectedOption === null ? 0.5 : 1 }}
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <div style={{ width: '100%', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                <div style={{ padding: '1rem', borderRadius: '0.75rem', background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isCorrect ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                                    {isCorrect ? <><CheckCircle size={24}/> Excellent! Difficulty will increase.</> : <><XCircle size={24}/> Incorrect. Difficulty adjusted.</>}
                                </div>
                                <button 
                                    onClick={handleNext} 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {questionNumber >= MAX_QUESTIONS_PER_SESSION ? 'Finish Session' : 'Next Question'} <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {sessionStatus === 'summary' && summaryData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <div className="glass-card" style={{ padding: '3rem 2rem' }}>
                        <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            <Award size={48} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>Practice Complete!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Here's how you performed in this adaptive session.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--card-border)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Accuracy</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: summaryData.score >= 70 ? '#10b981' : '#f59e0b' }}>
                                    {Math.round(summaryData.score)}%
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{summaryData.correctCount} / {summaryData.totalAnswered} Correct</div>
                            </div>
                            <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--card-border)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>XP Earned</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star size={24} fill="var(--primary)" /> +{summaryData.xpEarned}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>For practicing</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-around' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Starting Difficulty</div>
                                <div style={{ fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{summaryData.startingDifficulty}</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--card-border)' }} />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Final Difficulty</div>
                                <div style={{ fontWeight: 600, color: 'var(--primary)', textTransform: 'capitalize' }}>{summaryData.finalDifficulty}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '1rem', fontWeight: 700, fontSize: '1.05rem' }}>
                                Back to Dashboard
                            </button>
                            <button onClick={() => navigate(`/topic/${selectedTopicId}`)} className="btn" style={{ padding: '1rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--card-border)' }}>
                                Review This Topic
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdaptivePracticePage;
