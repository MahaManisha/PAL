import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, CheckSquare, Target, Play, ChevronRight, CheckCircle,
    HelpCircle, Lock, Zap, ArrowLeft, RefreshCw, Award, AlertCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { normalizeId } from '../utils/progressionEngine';
import { useProgression } from '../hooks/useProgression';
import AiTutorWidget from '../components/AiTutorWidget';

const TopicPage = () => {
    const { id } = useParams(); // topicId
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { themeConfig } = useTheme();

    const terminology = themeConfig?.terminology || {
        chapter: 'Chapter',
        topic: 'Topic',
        assessment: 'Assessment',
    };
    const experience = themeConfig?.experience || 'professional';

    // Theme-aware tab labels (presentation only)
    const TAB_LABELS = {
        learn: experience === 'gamified' ? 'Study Quest' : experience === 'cinematic' ? 'Scene Briefing' : 'Learn',
        practice: experience === 'gamified' ? 'Skill Practice' : experience === 'cinematic' ? 'Rehearsal' : 'Practice',
        assessment: experience === 'gamified' ? 'Boss Battle' : experience === 'cinematic' ? 'Audition' : 'Assessment Ready'
    };

    // Tab state (learn | practice | assessment)
    const initialTab = searchParams.get('tab') || 'learn';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Data state
    const [topicDetail, setTopicDetail] = useState(null);
    const [progressRecord, setProgressRecord] = useState(null);
    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmittingStage, setIsSubmittingStage] = useState(false);

    const subjectIdStr = topicDetail?.chapterId?.subjectId?._id ? String(topicDetail.chapterId.subjectId._id) : null;
    const { getTopicState, loading: progressionLoading } = useProgression(subjectIdStr);
    const [isGateResolved, setIsGateResolved] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Practice engine interactive state
    const [practiceAnswers, setPracticeAnswers] = useState({}); // { qIndex: selectedOption }
    const [practiceSubmitted, setPracticeSubmitted] = useState(false);
    const [practiceResult, setPracticeResult] = useState(null);
    const [nextTopic, setNextTopic] = useState(null);

    useEffect(() => {
        if (!id || !user?.id) return;

        const loadTopicData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Topic detail (with chapter and subject names)
                const topicRes = await apiClient.get(`/api/topics/detail/${id}`);
                setTopicDetail(topicRes.data);

                // Fetch sibling topics to resolve nextTopic
                const chapId = topicRes.data?.chapterId?._id || topicRes.data?.chapterId;
                if (chapId) {
                    try {
                        const siblingsRes = await apiClient.get(`/api/topics/${normalizeId(chapId)}`);
                        const siblings = Array.isArray(siblingsRes.data) ? [...siblingsRes.data] : [];
                        siblings.sort((a, b) => (a.order || 0) - (b.order || 0));
                        const currIndex = siblings.findIndex(t => normalizeId(t._id || t.id) === normalizeId(id));
                        if (currIndex !== -1 && currIndex + 1 < siblings.length) {
                            setNextTopic(siblings[currIndex + 1]);
                        } else {
                            setNextTopic(null);
                        }
                    } catch (e) {
                        console.warn('TopicPage: Could not fetch sibling topics', e);
                    }
                }

                // 2. Fetch User Progress for this topic
                const progRes = await apiClient.get(`/api/progress/${user.id}`);
                const records = Array.isArray(progRes.data) ? progRes.data : [];
                const matched = records.find(p => {
                    if (!p || !p.topicId) return false;
                    return normalizeId(p.topicId) === normalizeId(id);
                });

                setProgressRecord(matched || null);

                // 3. Fetch questions for Practice Engine
                const assRes = await apiClient.get(`/api/assessment/${id}`);
                setAssessmentData(assRes.data);

                // 4. Pre-fill practice result if previously calculated
                if (matched && (typeof matched.latestScore === 'number' || typeof matched.bestScore === 'number' || typeof matched.score === 'number')) {
                    const displayScore = typeof matched.latestScore === 'number' ? matched.latestScore : (typeof matched.bestScore === 'number' ? matched.bestScore : (typeof matched.score === 'number' ? matched.score : 0));
                    
                    let level = matched.currentLevel;
                    if (!level || level === 'PENDING' || level === 'LOW') {
                        if (level === 'LOW') level = 'WEAK';
                        else if (displayScore < 40) level = 'WEAK';
                        else if (displayScore < 70) level = 'MEDIUM';
                        else level = 'HIGH';
                    }

                    const questionCount = assRes.data?.questions?.length || 10;
                    setPracticeResult({
                        latestScore: displayScore,
                        score: matched.bestScore || displayScore,
                        currentLevel: level,
                        status: matched.status,
                        correctCount: Math.round((displayScore / 100) * questionCount),
                        totalQuestions: questionCount
                    });
                    if (matched.practiceCompleted || matched.status === 'pass') {
                        setPracticeSubmitted(true);
                    }
                }

            } catch (err) {
                console.error('TopicPage: Error loading topic details', err);
            } finally {
                setLoading(false);
            }
        };

        loadTopicData();
    }, [id, user?.id]);

    // Evaluate gate and auto-start
    useEffect(() => {
        if (loading || progressionLoading) return;

        if (!topicDetail) {
            setIsGateResolved(true);
            return;
        }

        const evaluateGate = async () => {
            const topicState = getTopicState(topicDetail, topicDetail.chapterId);
            const hasPassed = progressRecord?.status === 'pass';
            
            // Soft-pathing: relies on chapter lock.
            // Legacy compatibility: if already passed, never lock.
            const locked = topicState === 'LOCKED' && !hasPassed;

            setIsLocked(locked);

            if (!locked && !progressRecord) {
                try {
                    const startRes = await apiClient.post('/api/progress/start', {
                        userId: user.id,
                        topicId: id
                    });
                    setProgressRecord(startRes.data);
                } catch (err) {
                    console.error('TopicPage: Error starting topic', err);
                }
            }
            setIsGateResolved(true);
        };

        evaluateGate();
    }, [loading, progressionLoading, topicDetail, getTopicState, progressRecord, id, user?.id]);

    // Stage Completion Flags
    const isLearningCompleted = !!(progressRecord?.learningCompleted || progressRecord?.practiceCompleted || progressRecord?.status === 'pass');
    const isPracticeCompleted = !!(progressRecord?.practiceCompleted || progressRecord?.status === 'pass');
    const isPassed = progressRecord?.status === 'pass';

    // Validate URL tab accessibility once data and gates resolve
    useEffect(() => {
        if (loading || progressionLoading || !isGateResolved || isLocked) return;

        const requestedTab = searchParams.get('tab');
        
        if (requestedTab === 'practice') {
            if (!isLearningCompleted) {
                setActiveTab('learn');
            } else {
                setActiveTab('practice');
            }
        } else if (requestedTab === 'assessment') {
            if (!isPracticeCompleted) {
                setActiveTab(isLearningCompleted ? 'practice' : 'learn');
            } else {
                setActiveTab('assessment');
            }
        } else {
            // Default: Always open Tab 1 ('learn' - PPT Presentation)
            setActiveTab('learn');
        }
    }, [loading, progressionLoading, isGateResolved, isLocked, searchParams, isLearningCompleted, isPracticeCompleted]);

    // Complete Learning handler
    const handleCompleteLearning = async () => {
        if (!user?.id || !id) return;
        setIsSubmittingStage(true);
        try {
            const res = await apiClient.post('/api/progress/complete-learning', {
                userId: user.id,
                topicId: id
            });
            setProgressRecord(res.data);
            setActiveTab('practice');
        } catch (err) {
            console.error('TopicPage: Failed to complete learning', err);
        } finally {
            setIsSubmittingStage(false);
        }
    };

    // Answer evaluation helpers (handles number index 0..3, string index "0", letter "A", or option text)
    const getCorrectAnswerIndex = (q) => {
        if (!q || q.correctAnswer === undefined || q.correctAnswer === null) return 0;
        const c = q.correctAnswer;
        if (typeof c === 'number' && !isNaN(c)) return c;
        if (!isNaN(Number(c))) return Number(c);
        if (typeof c === 'string' && c.trim().length === 1) {
            const charCode = c.trim().toUpperCase().charCodeAt(0) - 65;
            if (charCode >= 0 && charCode < 10) return charCode;
        }
        if (typeof c === 'string' && Array.isArray(q.options)) {
            const foundIdx = q.options.findIndex(opt => String(opt).trim().toLowerCase() === c.trim().toLowerCase());
            if (foundIdx !== -1) return foundIdx;
        }
        return 0;
    };

    const checkIsAnswerCorrect = (q, selectedOption) => {
        if (!q || selectedOption === undefined || selectedOption === null) return false;
        const correctIdx = getCorrectAnswerIndex(q);
        
        if (typeof selectedOption === 'number') {
            return selectedOption === correctIdx;
        }
        if (!isNaN(Number(selectedOption))) {
            return Number(selectedOption) === correctIdx;
        }
        if (typeof selectedOption === 'string' && Array.isArray(q.options)) {
            if (selectedOption.trim().length === 1) {
                const charCode = selectedOption.trim().toUpperCase().charCodeAt(0) - 65;
                if (charCode >= 0 && charCode < 10) return charCode === correctIdx;
            }
            const optVal = q.options[correctIdx];
            if (optVal && String(optVal).trim().toLowerCase() === selectedOption.trim().toLowerCase()) {
                return true;
            }
        }
        return false;
    };

    // Practice option select with live recalculation for re-attempts
    const handleOptionSelect = (qIdx, oIdx) => {
        setPracticeAnswers(prev => {
            const updated = { ...prev, [qIdx]: oIdx };
            
            if (practiceQuestions.length > 0) {
                let correct = 0;
                practiceQuestions.forEach((q, i) => {
                    const userAns = updated[i];
                    if (userAns !== undefined && userAns !== null && checkIsAnswerCorrect(q, userAns)) {
                        correct++;
                    }
                });
                const newScore = (correct / practiceQuestions.length) * 100;
                let level = 'MEDIUM';
                if (newScore < 40) level = 'WEAK';
                else if (newScore < 70) level = 'MEDIUM';
                else level = 'HIGH';

                setPracticeResult({
                    latestScore: newScore,
                    score: Math.max(practiceResult?.score || 0, newScore),
                    currentLevel: level,
                    status: newScore >= 70 ? 'pass' : 'fail',
                    correctCount: correct,
                    totalQuestions: practiceQuestions.length
                });
            }
            return updated;
        });
    };

    // Complete Practice handler & Score Calculator
    const handleCompletePractice = async () => {
        if (!user?.id || !id) return;
        setIsSubmittingStage(true);
        try {
            const formattedAnswers = practiceQuestions.map((q, i) => ({
                questionId: q._id ? String(q._id) : (q.id ? String(q.id) : null),
                selectedOption: practiceAnswers[i] !== undefined && practiceAnswers[i] !== null ? practiceAnswers[i] : null
            }));

            // 1. Submit to score calculation endpoint
            const submitRes = await apiClient.post('/api/assessment/submit', {
                userId: user.id,
                topicId: id,
                answers: formattedAnswers
            });

            // 2. Mark stage as practiceCompleted
            const completeRes = await apiClient.post('/api/progress/complete-practice', {
                userId: user.id,
                topicId: id
            });

            const resScore = submitRes.data.latestScore !== undefined ? submitRes.data.latestScore : submitRes.data.score;
            const totalCount = submitRes.data.totalQuestions || totalPracticeQuestions || 10;
            const correctCountVal = submitRes.data.correctCount !== undefined 
                ? submitRes.data.correctCount 
                : Math.round((resScore / 100) * totalCount);

            setPracticeResult({
                latestScore: resScore,
                score: submitRes.data.score,
                correctCount: correctCountVal,
                totalQuestions: totalCount,
                currentLevel: submitRes.data.currentLevel || submitRes.data.category || 'MEDIUM',
                status: submitRes.data.status
            });
            setPracticeSubmitted(true);
            setProgressRecord(completeRes.data);

        } catch (err) {
            console.error('TopicPage: Failed to submit practice assessment', err);
        } finally {
            setIsSubmittingStage(false);
        }
    };

    if (loading || progressionLoading || !isGateResolved) {
        return (
            <div className="container" style={{ paddingTop: '6rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading topic journey...</div>
            </div>
        );
    }

    if (!topicDetail) {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
                    <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Topic Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        The requested topic could not be loaded. Please return to the dashboard.
                    </p>
                    <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.85rem 2rem' }}>
                        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
                    <Lock size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.6 }} />
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text)' }}>Topic Locked</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        You must complete the required earlier {terminology.chapter.toLowerCase()}s to unlock this topic.
                        Check your roadmap to see your next action.
                    </p>
                    <Link to={subjectIdStr ? `/subject/${subjectIdStr}` : '/dashboard'} className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.85rem 2rem', fontWeight: 600 }}>
                        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Return to Roadmap
                    </Link>
                </motion.div>
            </div>
        );
    }

    const topicName = topicDetail?.topicName || 'Topic';
    const chapterName = topicDetail?.chapterId?.chapterName || 'Chapter';
    const subjectName = topicDetail?.chapterId?.subjectId?.name || 'Subject';

    const folderChapter = chapterName.includes(':') ? chapterName.split(':')[0].trim() : chapterName;
    const slidesUrl = `/slides/${encodeURIComponent(subjectName)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(topicName)}?topicId=${id}`;

    // Practice items
    const practiceQuestions = assessmentData?.questions || [];
    const totalPracticeQuestions = practiceQuestions.length;
    const attemptedCount = Object.keys(practiceAnswers).length;
    const allAttempted = totalPracticeQuestions > 0 && attemptedCount === totalPracticeQuestions;

    return (
        <div className="container" style={{ paddingTop: '5rem', maxWidth: '1100px', paddingBottom: '5rem' }}>

            {/* Back button */}
            <Link
                to={topicDetail?.chapterId?.subjectId?._id ? `/subject/${topicDetail.chapterId.subjectId._id}` : '/dashboard'}
                className="btn btn-secondary"
                style={{ gap: '0.5rem', marginBottom: '2rem', display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }}
            >
                <ArrowLeft size={16} /> Back to {subjectName} Roadmap
            </Link>

            {/* Topic Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                    {chapterName}
                </div>
                <h1 className="heading-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>
                    {topicName}
                </h1>
            </div>

            {/* ── 3-Tab Workflow Navigation ── */}
            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '2.5rem',
                borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem'
            }}>
                {/* Tab 1: Learn */}
                <button
                    onClick={() => setActiveTab('learn')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '0.6rem',
                        border: 'none', cursor: 'pointer',
                        background: activeTab === 'learn' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'learn' ? '#fff' : 'var(--text-muted)',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <BookOpen size={18} />
                    1. {TAB_LABELS.learn}
                    {isLearningCompleted && <CheckCircle size={15} color="#10b981" style={{ marginLeft: '4px' }} />}
                </button>

                {/* Tab 2: Practice */}
                <button
                    onClick={() => isLearningCompleted && setActiveTab('practice')}
                    disabled={!isLearningCompleted}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '0.6rem',
                        border: 'none', cursor: isLearningCompleted ? 'pointer' : 'not-allowed',
                        background: activeTab === 'practice' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'practice' ? '#fff' : (isLearningCompleted ? 'var(--text)' : 'var(--text-muted)'),
                        opacity: isLearningCompleted ? 1 : 0.5,
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {!isLearningCompleted ? <Lock size={15} /> : <CheckSquare size={18} />}
                    2. {TAB_LABELS.practice}
                    {isPracticeCompleted && <CheckCircle size={15} color="#10b981" style={{ marginLeft: '4px' }} />}
                </button>

                {/* Tab 3: Assessment Ready */}
                <button
                    onClick={() => isPracticeCompleted && setActiveTab('assessment')}
                    disabled={!isPracticeCompleted}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '0.6rem',
                        border: 'none', cursor: isPracticeCompleted ? 'pointer' : 'not-allowed',
                        background: activeTab === 'assessment' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'assessment' ? '#fff' : (isPracticeCompleted ? 'var(--text)' : 'var(--text-muted)'),
                        opacity: isPracticeCompleted ? 1 : 0.5,
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {!isPracticeCompleted ? <Lock size={15} /> : <Target size={18} />}
                    3. {TAB_LABELS.assessment}
                    {isPassed && <Award size={15} color="#10b981" style={{ marginLeft: '4px' }} />}
                </button>
            </div>

            {/* ── Tab Content Views ── */}
            <AnimatePresence mode="wait">

                {/* TAB 1: LEARN (Slide & Video Hub) */}
                {activeTab === 'learn' && (
                    <motion.div
                        key="learn-tab"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-card"
                        style={{ padding: '2.5rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.8rem', background: 'rgba(37,99,235,0.15)', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Interactive Learning Materials</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                    Study slide decks and watch video lectures for {topicName}.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid var(--card-border)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Learning Objectives</h3>
                            <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.25rem', lineHeight: 1.6, margin: 0 }}>
                                <li>Understand core principles and mathematical definitions of {topicName}.</li>
                                <li>Study key properties, equations, and elementary row operations.</li>
                                <li>Review solved examples and video demonstrations before practice.</li>
                            </ul>
                        </div>

                        {/* Open Slides & Video Portal Button */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Link
                                to={slidesUrl}
                                state={{ topicId: id }}
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 1.75rem', fontWeight: 700 }}
                            >
                                <Play size={18} /> Launch Slides & Lecture Video Portal
                            </Link>

                            <button
                                onClick={handleCompleteLearning}
                                disabled={isSubmittingStage}
                                className="btn"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.9rem 1.75rem', fontWeight: 700,
                                    background: isLearningCompleted ? 'rgba(16,185,129,0.15)' : 'var(--surface)',
                                    border: isLearningCompleted ? '1px solid #10b981' : '1px solid var(--card-border)',
                                    color: isLearningCompleted ? '#10b981' : 'var(--text)',
                                    opacity: isSubmittingStage ? 0.7 : 1
                                }}
                            >
                                <CheckCircle size={18} />
                                {isLearningCompleted ? 'Learning Completed ✓' : 'Complete Learning & Proceed to Practice'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* TAB 2: PRACTICE (Interactive Formative Practice Engine) */}
                {activeTab === 'practice' && (
                    <motion.div
                        key="practice-tab"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-card"
                        style={{ padding: '2.5rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.8rem', background: 'rgba(245,158,11,0.15)', borderRadius: '0.75rem', color: '#f59e0b' }}>
                                <Zap size={28} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Formative Practice Engine</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                    Test your understanding with immediate feedback. Practice does not affect your assessment score.
                                </p>
                            </div>
                        </div>

                        {totalPracticeQuestions === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No practice questions available for this topic yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                {practiceQuestions.map((q, qIdx) => {
                                    const selectedOption = practiceAnswers[qIdx];
                                    const hasAnswered = typeof selectedOption === 'number';

                                    return (
                                        <div
                                            key={qIdx}
                                            style={{
                                                padding: '1.5rem',
                                                background: 'var(--input-bg)',
                                                borderRadius: '0.75rem',
                                                border: '1px solid var(--card-border)'
                                            }}
                                        >
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
                                                {qIdx + 1}. {q.questionText}
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                {q.options.map((opt, oIdx) => {
                                                    let border = '1px solid var(--card-border)';
                                                    let bg = 'var(--surface)';
                                                    let color = 'var(--text)';

                                                    const correctIdx = getCorrectAnswerIndex(q);
                                                    const isCorrectOpt = Number(oIdx) === correctIdx;
                                                    const isUserSelected = Number(oIdx) === Number(selectedOption);

                                                    if (hasAnswered) {
                                                        if (isCorrectOpt) {
                                                            border = '1px solid #10b981';
                                                            bg = 'rgba(16,185,129,0.15)';
                                                            color = '#10b981';
                                                        } else if (isUserSelected && !isCorrectOpt) {
                                                            border = '1px solid #ef4444';
                                                            bg = 'rgba(239,68,68,0.15)';
                                                            color = '#ef4444';
                                                        }
                                                    }

                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => handleOptionSelect(qIdx, oIdx)}
                                                            style={{
                                                                padding: '0.75rem 1rem', textAlign: 'left',
                                                                cursor: 'pointer', background: bg, border, borderRadius: '0.5rem',
                                                                color, fontSize: '0.92rem', transition: 'all 0.2s', width: '100%',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                                            }}
                                                        >
                                                            <span>
                                                                <strong style={{ marginRight: '0.5rem' }}>{String.fromCharCode(65 + oIdx)}.</strong>
                                                                {opt}
                                                            </span>
                                                            {hasAnswered && isCorrectOpt && <CheckCircle size={16} color="#10b981" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation feedback note */}
                                            {hasAnswered && (
                                                <div style={{
                                                    marginTop: '0.85rem', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                                                    fontSize: '0.85rem',
                                                    background: checkIsAnswerCorrect(q, selectedOption) ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: checkIsAnswerCorrect(q, selectedOption) ? '#10b981' : '#ef4444',
                                                    border: checkIsAnswerCorrect(q, selectedOption) ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
                                                }}>
                                                    {checkIsAnswerCorrect(q, selectedOption)
                                                        ? '✓ Correct! Good job.'
                                                        : `✗ Incorrect. The correct answer is Option ${String.fromCharCode(65 + getCorrectAnswerIndex(q))}.`}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Finish Practice CTA */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {attemptedCount} of {totalPracticeQuestions} items attempted
                            </span>

                            <button
                                onClick={handleCompletePractice}
                                disabled={isSubmittingStage}
                                className="btn btn-primary"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.9rem 1.75rem', fontWeight: 700,
                                    opacity: isSubmittingStage ? 0.6 : 1,
                                    cursor: 'pointer'
                                }}
                            >
                                <CheckSquare size={18} />
                                {isSubmittingStage ? 'Calculating Score...' : (practiceSubmitted ? 'Recalculate & Re-submit Assessment' : 'Calculate Score & Submit Assessment')}
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Practice Assessment Calculated Result Card */}
                        {practiceSubmitted && practiceResult && (() => {
                            const scoreVal = typeof practiceResult.latestScore === 'number' && !isNaN(practiceResult.latestScore)
                                ? practiceResult.latestScore
                                : (typeof practiceResult.score === 'number' && !isNaN(practiceResult.score) ? practiceResult.score : 0);
                            
                            const roundedScore = Math.round(scoreVal);
                            const isPass = roundedScore >= 70;
                            
                            let cat = practiceResult.currentLevel;
                            if (!cat || cat === 'PENDING' || cat === 'LOW') {
                                if (cat === 'LOW') cat = 'WEAK';
                                else if (roundedScore < 40) cat = 'WEAK';
                                else if (roundedScore < 70) cat = 'MEDIUM';
                                else cat = 'HIGH';
                            }
                            
                            const badgeColor = cat === 'HIGH' ? '#22c55e' : (cat === 'MEDIUM' ? '#eab308' : '#ef4444');
                            const badgeBg = cat === 'HIGH' ? 'rgba(34,197,94,0.15)' : (cat === 'MEDIUM' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)');

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginTop: '2.5rem', padding: '2rem 2.5rem', borderRadius: '1.25rem',
                                        background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
                                        border: '1.5px solid rgba(255,255,255,0.15)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 700 }}>
                                        Practice Assessment Calculated Result
                                    </div>
                                    <div style={{ fontSize: '3.2rem', fontWeight: 900, color: badgeColor, lineHeight: 1.1 }}>
                                        {roundedScore}%
                                    </div>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0.5rem 0 1rem' }}>
                                        {practiceResult.correctCount !== undefined ? `${practiceResult.correctCount} / ${practiceResult.totalQuestions || totalPracticeQuestions} Questions Correct` : 'Assessment Evaluated & Recorded'}
                                    </div>

                                    {/* Student Classification Badge */}
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.45rem 1.25rem', borderRadius: '999px',
                                        background: badgeBg,
                                        border: `1.5px solid ${badgeColor}`,
                                        color: badgeColor,
                                        fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.25rem'
                                    }}>
                                        <Zap size={16} />
                                        Student Category: {cat}
                                    </div>

                                    {/* Recommendation Notice Box */}
                                    {!isPass ? (
                                        <div style={{
                                            margin: '0 auto 1.5rem', padding: '1rem 1.25rem', borderRadius: '0.85rem',
                                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                                            color: '#f87171', fontSize: '0.95rem', fontWeight: 600, maxWidth: '580px',
                                            lineHeight: 1.5
                                        }}>
                                            ⚠️ You need much more practice in this topic! Please review the {topicName} presentation again to strengthen your understanding before taking the final assessment.
                                        </div>
                                    ) : (
                                        <div style={{
                                            margin: '0 auto 1.5rem', padding: '1rem 1.25rem', borderRadius: '0.85rem',
                                            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
                                            color: '#4ade80', fontSize: '0.95rem', fontWeight: 600, maxWidth: '580px',
                                            lineHeight: 1.5
                                        }}>
                                            🎉 Great Mastery! You passed the Practice Assessment. You are ready to proceed to the Final Assessment or next topic.
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <Link
                                            to={slidesUrl}
                                            className="btn btn-primary"
                                            style={{
                                                padding: '0.9rem 1.75rem', fontWeight: 700, fontSize: '0.95rem',
                                                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                                background: !isPass ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                                boxShadow: !isPass ? '0 4px 15px rgba(59,130,246,0.4)' : '0 4px 15px rgba(16,185,129,0.4)'
                                            }}
                                        >
                                            <BookOpen size={18} /> Review {topicName} Presentation (PPT)
                                        </Link>
                                        {isPass && (
                                            <>
                                                <button
                                                    onClick={() => setActiveTab('assessment')}
                                                    className="btn"
                                                    style={{ padding: '0.9rem 1.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#cbd5e1', fontWeight: 600 }}
                                                >
                                                    Proceed to Final Gateway →
                                                </button>
                                                {nextTopic && (
                                                    <Link
                                                        to={`/topic/${normalizeId(nextTopic._id || nextTopic.id)}?tab=learn`}
                                                        className="btn btn-primary"
                                                        style={{
                                                            padding: '0.9rem 1.75rem', fontWeight: 700, fontSize: '0.95rem',
                                                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                            boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
                                                        }}
                                                    >
                                                        Proceed to {nextTopic.topicName || 'Next Topic'} Presentation (PPT) →
                                                    </Link>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </motion.div>
                )}

                {/* TAB 3: ASSESSMENT READY (Final Gateway) */}
                {activeTab === 'assessment' && (
                    <motion.div
                        key="assessment-tab"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-card"
                        style={{ padding: '3rem', textAlign: 'center' }}
                    >
                        <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(16,185,129,0.12)', borderRadius: '50%', color: '#10b981', marginBottom: '1.5rem' }}>
                            <Target size={48} />
                        </div>

                        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                            Assessment Unlocked!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                            You have completed both the <strong>Learn</strong> and <strong>Practice</strong> stages for {topicName}.
                            Prove your mastery with a score of 70% or higher to unlock the next chapter.
                        </p>

                        <div style={{ display: 'inline-flex', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 2rem', borderRadius: '1rem', marginBottom: '2.5rem', border: '1px solid var(--card-border)' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pass Mark</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>70%</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--card-border)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Questions</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{totalPracticeQuestions}</div>
                            </div>
                        </div>

                        <div>
                            <Link
                                to={`/assessment/${id}`}
                                state={{ subjectId: topicDetail?.chapterId?.subjectId?._id ? String(topicDetail.chapterId.subjectId._id) : null }}
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700 }}
                            >
                                Start Final Assessment <Play size={18} />
                            </Link>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* AI Tutor Widget with Full Context */}
            {topicDetail && (
                <AiTutorWidget 
                    contextData={{
                        subjectName: topicDetail.chapterId?.subjectId?.name || topicDetail.chapterId?.subjectId?.subjectName,
                        chapterName: topicDetail.chapterId?.chapterName,
                        topicName: topicDetail.topicName,
                        status: progressRecord?.status || 'unstarted',
                        currentScore: progressRecord?.bestScore || 0,
                        weakAreas: (progressRecord?.attempts || [])
                            .flatMap(a => a.mistakes)
                            .filter(m => m?.conceptTag)
                            .map(m => m.conceptTag)
                    }} 
                />
            )}
        </div>
    );
};

export default TopicPage;
