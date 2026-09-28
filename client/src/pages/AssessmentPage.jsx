import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle, Award, ChevronRight, Check, CheckCircle, XCircle, Lock, ArrowLeft,
    Star, Zap, Film, Sparkles, Trophy, Target, RefreshCw, BookOpen,
    ChevronRightSquare, Loader
} from 'lucide-react';
import {
    normalizeId,
    normalizeProgress,
    getMasteryBand,
    determineNextAction
} from '../utils/progressionEngine';
import AchievementUnlockModal from '../components/AchievementUnlockModal';

// ─── Themed result copy ────────────────────────────────────────────────────────
function getResultCopy(masteryBand, experience, terminology) {
    const t = terminology || {};
    if (masteryBand === 'HIGH') {
        if (experience === 'gamified') return { heading: 'Boss Defeated! 🏆', sub: 'Outstanding performance. You dominated this quest!' };
        if (experience === 'cinematic') return { heading: 'Scene Mastered! 🎬', sub: 'A flawless performance. This scene is in the can.' };
        return { heading: 'Excellent Work! ⭐', sub: 'High mastery achieved. You are ready to move forward.' };
    }
    if (masteryBand === 'STANDARD') {
        if (experience === 'gamified') return { heading: 'Quest Cleared! ✅', sub: 'Solid performance. The next quest awaits.' };
        if (experience === 'cinematic') return { heading: 'Performance Complete! ✅', sub: 'Good work on this scene. On to the next.' };
        return { heading: `${t.assessment || 'Assessment'} Passed ✅`, sub: 'Topic mastered. Continue your learning journey.' };
    }
    if (masteryBand === 'NEEDS_IMPROVEMENT') {
        if (experience === 'gamified') return { heading: 'Training Required 💪', sub: 'The boss survived this time. Review your skills and try again.' };
        if (experience === 'cinematic') return { heading: 'Rehearsal Needed 🎭', sub: 'Study your lines and come back stronger for the next take.' };
        return { heading: 'Needs Improvement 📖', sub: 'Review the material and try again when ready.' };
    }
    // SUBJECT_COMPLETE or NONE
    return { heading: 'Result', sub: '' };
}

// ─── Mastery badge ─────────────────────────────────────────────────────────────
function MasteryBadge({ band, experience }) {
    if (band === 'HIGH') {
        const color = experience === 'gamified' ? '#f59e0b' : experience === 'cinematic' ? '#a78bfa' : '#10b981';
        return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '999px', background: `${color}18`, border: `1px solid ${color}55`, color, fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <Star size={13} /> High Mastery
            </div>
        );
    }
    if (band === 'STANDARD') {
        return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <Check size={13} /> Standard Mastery
            </div>
        );
    }
    if (band === 'NEEDS_IMPROVEMENT') {
        return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '999px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <Target size={13} /> Needs Improvement
            </div>
        );
    }
    return null;
}

// ─── Score display row ─────────────────────────────────────────────────────────
function ScoreRow({ latestScore, bestScore, isPreviouslyPassedLowerRetake }) {
    const same = Math.round(latestScore) === Math.round(bestScore);
    return (
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0 0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>This Attempt</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: latestScore >= 70 ? '#10b981' : '#f43f5e' }}>{Math.round(latestScore)}%</div>
            </div>
            {!same && (
                <>
                    <div style={{ width: '1px', background: 'var(--card-border)', alignSelf: 'stretch' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Best Score</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{Math.round(bestScore)}%</div>
                    </div>
                </>
            )}
            {same && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Best Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{Math.round(bestScore)}%</div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
const AssessmentPage = ({ type = 'TOPIC' }) => {
    const { topicId, chapterId } = useParams();
    const location = useLocation();
    const { user, updateUserStats } = useContext(AuthContext);
    const { themeConfig } = useTheme();
    const terminology = themeConfig?.terminology || { assessment: 'Assessment', topic: 'Topic', chapter: 'Chapter', complete: 'Completed' };
    const reward = themeConfig?.reward || { emoji: '⭐', label: 'Points' };
    const experience = themeConfig?.experience || 'professional';
    const navigate = useNavigate();

    // ── Core state ──────────────────────────────────────────────────────────────
    const [assessment, setAssessment] = useState(null);
    const [topicDetails, setTopicDetails] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [isGateAllowed, setIsGateAllowed] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // ── Result state ────────────────────────────────────────────────────────────
    const [result, setResult] = useState(null);       // API response: { score: bestScore, status, user }
    const [latestScore, setLatestScore] = useState(null);  // client-computed current attempt score
    const [masteryBand, setMasteryBand] = useState(null);
    const [nextAction, setNextAction] = useState(null);
    const [resultLoading, setResultLoading] = useState(false); // while resolving next action
    const [rewardEarned, setRewardEarned] = useState(false);
    const [isPreviouslyPassedLowerRetake, setIsPreviouslyPassedLowerRetake] = useState(false);
    const [newlyUnlocked, setNewlyUnlocked] = useState([]);

    // ── subjectId resolution ────────────────────────────────────────────────────
    // Priority 1: location.state (set by TopicPage)
    // Priority 2: derived from GET /api/topics/detail/:topicId → chapterId.subjectId
    // Priority 3: graceful fallback (null) — limited CTAs only
    const [subjectId, setSubjectId] = useState(location.state?.subjectId || null);
    const [chapters, setChapters] = useState([]);

    // ── Gate check + assessment fetch ───────────────────────────────────────────
    useEffect(() => {
        const fetchAssessmentAndGate = async () => {
            setLoading(true);
            try {
                // 1. Gate check
                if (user?.id && type === 'TOPIC' && topicId) {
                    const progRes = await apiClient.get(`/api/progress/${user.id}`);
                    const records = Array.isArray(progRes.data) ? progRes.data : [];
                    const matched = records.find(p => {
                        if (!p || !p.topicId) return false;
                        return normalizeId(p.topicId) === normalizeId(topicId);
                    });
                    // Gate: practiceCompleted OR already passed (legacy)
                    const allowed = matched && (matched.practiceCompleted === true || matched.status === 'pass');
                    setIsGateAllowed(!!allowed);
                } else {
                    // Always allow chapter-level INITIAL and FINAL assessments for now
                    setIsGateAllowed(true);
                }

                // 2. Fetch assessment questions
                let res;
                if (type === 'TOPIC') {
                    res = await apiClient.get(`/api/assessment/${topicId}`);
                } else {
                    res = await apiClient.get(`/api/assessment/chapter/${chapterId}/${type}`);
                }

                // Randomize and limit to 20 questions
                if (res.data && res.data.questions) {
                    const shuffled = [...res.data.questions].sort(() => 0.5 - Math.random());
                    res.data.questions = shuffled.slice(0, 20);
                }

                setAssessment(res.data);
                // 3. Resolve subjectId if not from location.state
                const stateSubjectId = location.state?.subjectId;
                if (!stateSubjectId) {
                    try {
                        // GET /api/topics/detail/:id populates chapterId → subjectId
                        const topicRes = await apiClient.get(`/api/topics/detail/${topicId}`);
                        const derivedSubjectId = topicRes.data?.chapterId?.subjectId?._id;
                        if (derivedSubjectId) setSubjectId(String(derivedSubjectId));
                    } catch (e) {
                        console.warn('AssessmentPage: Could not derive subjectId', e);
                    }
                }
            } catch (err) {
                console.error('AssessmentPage: Error fetching data', err);
            } finally {
                setLoading(false);
            }
        };


        fetchAssessmentAndGate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, chapterId, type, user?.id]);

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

    // ── Compute client-side latest score before submission ──────────────────────
    const computeLocalScore = useCallback(() => {
        if (!assessment?.questions?.length) return 0;
        let correct = 0;
        assessment.questions.forEach((q, i) => {
            const userAns = answers[i];
            if (userAns !== undefined && userAns !== null && checkIsAnswerCorrect(q, userAns)) {
                correct++;
            }
        });
        return (correct / assessment.questions.length) * 100;
    }, [assessment, answers]);

    // ── Resolve next action after submission ────────────────────────────────────
    const resolveNextAction = useCallback(async (apiResult) => {
        if (!subjectId || !user?.id) return;
        setResultLoading(true);
        try {
            // 1. Fetch chapters for this subject
            const chapRes = await apiClient.get(`/api/chapters/${subjectId}`);
            let fetchedChapters = Array.isArray(chapRes.data) ? [...chapRes.data] : [];
            fetchedChapters.sort((a, b) => (a.order || 0) - (b.order || 0));

            // 2. Fetch topics per chapter
            const topicPromises = fetchedChapters.map(c =>
                apiClient.get(`/api/topics/${normalizeId(c._id || c.id)}`)
            );
            const topicResponses = await Promise.all(topicPromises);
            const tree = fetchedChapters.map((c, i) => {
                let tops = Array.isArray(topicResponses[i].data) ? [...topicResponses[i].data] : [];
                tops.sort((a, b) => (a.order || 0) - (b.order || 0));
                return { ...c, topics: tops };
            });
            setChapters(tree);

            // 3. Fetch refreshed progress (assessment has now been saved)
            const progRes = await apiClient.get(`/api/progress/${user.id}`);
            const freshRecords = Array.isArray(progRes.data) ? progRes.data : [];

            // 4. Determine next action
            const action = determineNextAction(subjectId, tree, freshRecords);
            setNextAction(action);
        } catch (err) {
            console.error('AssessmentPage: Error resolving next action', err);
        } finally {
            setResultLoading(false);
        }
    }, [subjectId, user?.id]);

    // ── Submit handler ──────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        // Capture local score BEFORE submission (same formula as server)
        const thisAttemptScore = computeLocalScore();
        setLatestScore(thisAttemptScore);

        // Also detect "previously passed" state BEFORE submission
        let wasPreviouslyPassed = false;
        try {
            const preProg = await apiClient.get(`/api/progress/${user.id}`);
            const preRecords = Array.isArray(preProg.data) ? preProg.data : [];
            const preMatched = preRecords.find(p => p && normalizeId(p.topicId) === normalizeId(topicId));
            wasPreviouslyPassed = preMatched?.status === 'pass';
        } catch (_) { /* non-critical */ }

        try {
            const formattedAnswers = assessment.questions.map((q, i) => ({
                questionId: q._id ? String(q._id) : (q.id ? String(q.id) : null),
                selectedOption: answers[i] !== undefined && answers[i] !== null ? answers[i] : null
            }));

            const res = await apiClient.post('/api/assessment/submit', {
                userId: user.id,
                topicId: type === 'TOPIC' ? topicId : undefined,
                chapterId: type !== 'TOPIC' ? chapterId : undefined,
                type: type,
                answers: formattedAnswers
            });

            if (res.data.user) {
                updateUserStats(res.data.user);
                setRewardEarned(true);
            }

            if (res.data.latestScore !== undefined) {
                setLatestScore(res.data.latestScore);
            }

            const bestScore = res.data.score; // backend always returns bestScore
            const band = getMasteryBand(bestScore);
            setMasteryBand(band);
            setResult(res.data);

            if (res.data.newlyUnlockedAchievements?.length > 0) {
                setNewlyUnlocked(res.data.newlyUnlockedAchievements);
            }

            // Detect previously-passed + lower-retake scenario
            const isLowerRetake = wasPreviouslyPassed && thisAttemptScore < bestScore;
            setIsPreviouslyPassedLowerRetake(isLowerRetake);

            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // If it's an INITIAL assessment, we can route directly to the learning path page
            if (type === 'INITIAL') {
                navigate(`/chapter/${chapterId}/learning-path`);
                return;
            }

            // Resolve next action asynchronously for non-INITIAL
            await resolveNextAction(res.data);

        } catch (err) {
            console.error('AssessmentPage: Error submitting assessment', err);
        }
    };

    const handleOptionSelect = (oIdx) => {
        if (isFlipped) return; // Prevent changing answer after flip
        setAnswers({ ...answers, [currentQuestionIndex]: oIdx });
        setIsFlipped(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (assessment?.questions?.length || 0) - 1) {
            setIsFlipped(false);
            // Small delay to hide text change during flip back
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 150); 
        } else {
            handleSubmit();
        }
    };

    // ══════════════════════════════════════════════════════════════════════════
    // LOADING
    // ══════════════════════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                    Loading {terminology.assessment?.toLowerCase() || 'assessment'}...
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GATE SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (!isGateAllowed) {
        return (
            <div className="container" style={{ paddingTop: '6rem', maxWidth: '560px', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ padding: '3rem 2rem' }}
                >
                    <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(239,68,68,0.12)', borderRadius: '50%', color: '#ef4444', marginBottom: '1.5rem' }}>
                        <Lock size={48} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
                        {terminology.assessment || 'Assessment'} Locked 🔒
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        You must complete the <strong>Learn</strong> and <strong>Practice</strong> stages for this {terminology.topic?.toLowerCase() || 'topic'} before attempting the Final {terminology.assessment || 'Assessment'}.
                    </p>
                    <Link
                        to={`/topic/${topicId}`}
                        className="btn btn-primary"
                        style={{ padding: '0.9rem 2rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={18} /> Return to {terminology.topic || 'Topic'} Learning
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // NO ASSESSMENT FOUND
    // ══════════════════════════════════════════════════════════════════════════
    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <HelpCircle size={60} color="var(--error, #ef4444)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                    <h3>No {terminology.assessment?.toLowerCase() || 'assessment'} found</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        This {terminology.topic?.toLowerCase() || 'topic'} does not have an assessment configured yet.
                    </p>
                </div>
            </div>
        );
    }

    const totalQuestions = assessment.questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = (answeredCount / totalQuestions) * 100;
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];

    // ══════════════════════════════════════════════════════════════════════════
    // RESULT SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (result) {
        const bestScore = result.score; // backend always returns bestScore
        const displayLatestScore = latestScore !== null ? latestScore : bestScore;
        const passed = result.status === 'pass';
        const copy = isPreviouslyPassedLowerRetake ? { heading: 'Topic Already Mastered ⭐', sub: 'Your latest attempt scored lower, but your previous mastery is retained.' } : getResultCopy(masteryBand, experience, terminology);
        const isSubjectComplete = nextAction?.type === 'SUBJECT_COMPLETE';

        // Icon per band
        const IconComp = masteryBand === 'HIGH'
            ? <Trophy size={72} color={experience === 'gamified' ? '#f59e0b' : experience === 'cinematic' ? '#a78bfa' : '#10b981'} />
            : masteryBand === 'STANDARD'
            ? <Award size={72} color="#10b981" />
            : <XCircle size={72} color="#f43f5e" />;

        return (
            <>
            <AchievementUnlockModal achievements={newlyUnlocked} onClose={() => setNewlyUnlocked([])} />
            <div className="container" style={{ paddingTop: '5rem', maxWidth: '720px', textAlign: 'center', paddingBottom: '5rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 280 }}
                    className="glass-card"
                    style={{ padding: '3rem 2.5rem' }}
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                        style={{ marginBottom: '1.25rem' }}
                    >
                        {IconComp}
                    </motion.div>

                    {/* Mastery badge */}
                    <MasteryBadge band={masteryBand} experience={experience} />

                    {/* Heading */}
                    <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text)' }}>
                        {copy.heading}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', lineHeight: 1.5 }}>
                        {copy.sub}
                    </p>

                    {/* Previously-passed lower-retake note */}
                    {isPreviouslyPassedLowerRetake && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ margin: '0.75rem auto', padding: '0.6rem 1.25rem', borderRadius: '0.6rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b', fontSize: '0.85rem', maxWidth: '520px' }}
                        >
                            ℹ️ This attempt: {Math.round(displayLatestScore)}% · Best: {Math.round(bestScore)}% · {terminology.topic || 'Topic'} remains mastered.
                        </motion.div>
                    )}

                    {/* Score display */}
                    <ScoreRow latestScore={displayLatestScore} bestScore={bestScore} isPreviouslyPassedLowerRetake={isPreviouslyPassedLowerRetake} />

                    {/* Reward earned */}
                    {rewardEarned && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.1rem', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, margin: '0.75rem 0' }}
                        >
                            {reward.emoji} +10 {reward.label} earned!
                        </motion.div>
                    )}

                    {/* SUBJECT COMPLETE */}
                    {isSubjectComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            style={{ margin: '1.5rem 0', padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.25rem' }}>Subject Complete!</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have mastered every {terminology.topic?.toLowerCase() || 'topic'} in this subject.</div>
                        </motion.div>
                    )}

                    {/* CTA loading */}
                    {resultLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', margin: '1.5rem 0' }}>
                            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Finding your next step…
                        </div>
                    )}

                    {/* CTAs */}
                    {!resultLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}
                        >
                            {/* ─── PASSED & ABOVE AVERAGE BRANCH ───────────────────────────────────────────── */}
                            {passed && (
                                <>
                                    <Link
                                        to={`/topic/${topicId || '6a998c8a8d48f24fd34556e1'}?tab=learn`}
                                        className="btn"
                                        style={{ padding: '0.9rem 1.5rem', border: '1px solid var(--card-border)', background: 'transparent', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <BookOpen size={18} /> Review Presentation (PPT)
                                    </Link>
                                    
                                    {nextAction && nextAction.route && (
                                        <button
                                            onClick={() => {
                                                let targetRoute = nextAction.route;
                                                if (targetRoute && targetRoute.startsWith('/topic/') && !targetRoute.includes('?tab=')) {
                                                    targetRoute += '?tab=learn';
                                                }
                                                navigate(targetRoute);
                                            }}
                                            className="btn btn-primary"
                                            style={{
                                                padding: '0.9rem 1.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
                                            }}
                                        >
                                            Proceed to {nextAction.title || 'Next Topic'} Presentation (PPT) →
                                        </button>
                                    )}

                                    <Link
                                        to="/dashboard"
                                        className="btn"
                                        style={{ padding: '0.9rem 1.25rem', border: '1px solid var(--card-border)', background: 'transparent', fontWeight: 600 }}
                                    >
                                        Dashboard
                                    </Link>
                                </>
                            )}

                            {/* ─── PASSED but no nextAction (fallback) ─────────────────────── */}
                            {passed && !isSubjectComplete && (!nextAction || !nextAction.route) && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="btn btn-primary"
                                        style={{ padding: '0.9rem 1.75rem', fontWeight: 700 }}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to={`/topic/${topicId}`}
                                        className="btn"
                                        style={{ padding: '0.9rem 1.5rem', border: '1px solid var(--card-border)', background: 'transparent' }}
                                    >
                                        Return to {terminology.topic || 'Topic'}
                                    </Link>
                                </>
                            )}

                            {/* ─── SUBJECT COMPLETE ─────────────────────────────────────────── */}
                            {isSubjectComplete && (
                                <>
                                    {subjectId && (
                                        <Link
                                            to={`/subject/${subjectId}`}
                                            className="btn btn-primary"
                                            style={{ padding: '0.9rem 1.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <ChevronRightSquare size={18} /> Return to Subject Roadmap
                                        </Link>
                                    )}
                                    <Link
                                        to="/dashboard"
                                        className="btn"
                                        style={{ padding: '0.9rem 1.5rem', border: '1px solid var(--card-border)', background: 'transparent', fontWeight: 600 }}
                                    >
                                        Dashboard
                                    </Link>
                                </>
                            )}

                            {/* ─── FAILED BRANCH ────────────────────────────────────────────── */}
                            {!passed && (
                                <>
                                    {/* Primary: Review topic */}
                                    <Link
                                        to={`/topic/${topicId}`}
                                        className="btn btn-primary"
                                        style={{ padding: '0.9rem 1.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <BookOpen size={18} /> Review {terminology.topic || 'Topic'}
                                    </Link>
                                    {/* Secondary: Retry assessment */}
                                    <button
                                        onClick={() => {
                                            setResult(null);
                                            setAnswers({});
                                            setLatestScore(null);
                                            setMasteryBand(null);
                                            setNextAction(null);
                                            setRewardEarned(false);
                                            setIsPreviouslyPassedLowerRetake(false);
                                            setCurrentQuestionIndex(0);
                                            setIsFlipped(false);
                                            window.scrollTo({ top: 0 });
                                        }}
                                        className="btn"
                                        style={{ padding: '0.9rem 1.5rem', border: '1px solid var(--card-border)', background: 'transparent', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        <RefreshCw size={16} /> Retry {terminology.assessment || 'Assessment'}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>
            </>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // QUESTION SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    const currentQ = assessment.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const selectedAnswerIdx = answers[currentQuestionIndex];
    const isCorrect = checkIsAnswerCorrect(currentQ, selectedAnswerIdx);
    const correctOptionIdx = getCorrectAnswerIndex(currentQ);

    return (
        <div className="container" style={{ paddingTop: '3rem', maxWidth: '840px', paddingBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Assessment Header Bar */}
            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '999px',
                            padding: '0.45rem 1rem',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--card-border)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <ArrowLeft size={16} /> Exit Assessment
                    </button>

                    <div style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '999px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                    }}>
                        <Sparkles size={14} />
                        {type === 'INITIAL' ? 'Initial Assessment' : type === 'FINAL' ? 'Final Assessment' : `${terminology.assessment || 'Assessment'}`}
                    </div>
                </div>

                {/* Progress Card Header */}
                <div className="glass-card" style={{ padding: '1.5rem 1.75rem', borderRadius: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h2 className="heading-gradient" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem', lineHeight: 1.2 }}>
                                {type === 'INITIAL' ? 'Initial Diagnostic Test' : type === 'FINAL' ? 'Chapter Final Assessment' : `${terminology.assessment || 'Assessment'}`}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                Question <span style={{ fontWeight: 700, color: 'var(--text)' }}>{currentQuestionIndex + 1}</span> of {totalQuestions}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>
                                Progress
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>
                                {answeredCount} / {totalQuestions}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar with theme-safe background track */}
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--card-border)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                borderRadius: '999px'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Grid Overlay 3D Card Container */}
            <div style={{ perspective: '1200px', width: '100%' }}>
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gridTemplateRows: '1fr',
                        transformStyle: 'preserve-3d',
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    {/* ─── CARD FRONT (Question & Options) ─── */}
                    <div className="glass-card" style={{
                        gridArea: '1 / 1 / 2 / 2',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        padding: '2.5rem 2.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.75rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        border: '1px solid var(--card-border)',
                        background: 'var(--surface)',
                        borderRadius: '1.25rem',
                        opacity: isFlipped ? 0 : 1,
                        pointerEvents: isFlipped ? 'none' : 'auto',
                        transition: 'opacity 0.2s ease'
                    }}>
                        {/* Question Text Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <span style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '0.5rem',
                                flexShrink: 0,
                                marginTop: '0.2rem',
                                boxShadow: '0 4px 10px rgba(37,99,235,0.25)'
                            }}>
                                Q{currentQuestionIndex + 1}
                            </span>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                lineHeight: 1.6,
                                color: 'var(--text)',
                                margin: 0
                            }}>
                                {currentQ.questionText}
                            </h3>
                        </div>

                        {/* Options Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%' }}>
                            {currentQ.options.map((opt, oIdx) => {
                                const isSelected = selectedAnswerIdx === oIdx;
                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleOptionSelect(oIdx)}
                                        style={{
                                            padding: '1.1rem 1.35rem',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--input-bg)',
                                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                            borderRadius: '0.85rem',
                                            color: 'var(--text)',
                                            fontWeight: isSelected ? 600 : 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.15)' : '0 2px 5px rgba(0, 0, 0, 0.02)',
                                            wordBreak: 'break-word',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = 'var(--card-border)';
                                                e.currentTarget.style.background = 'var(--input-bg)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.85rem',
                                            fontWeight: 800,
                                            flexShrink: 0,
                                            background: isSelected ? 'var(--primary)' : 'var(--card-border)',
                                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            {alphabet[oIdx]}
                                        </span>
                                        <span style={{ fontSize: '1.05rem', lineHeight: 1.5, flex: 1 }}>{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── CARD BACK (Feedback & Next Question) ─── */}
                    <div className="glass-card" style={{
                        gridArea: '1 / 1 / 2 / 2',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        padding: '2.5rem 2.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        border: isCorrect ? '2px solid rgba(16, 185, 129, 0.4)' : '2px solid rgba(239, 68, 68, 0.4)',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                        borderRadius: '1.25rem',
                        opacity: isFlipped ? 1 : 0,
                        pointerEvents: isFlipped ? 'auto' : 'none',
                        transition: 'opacity 0.2s ease'
                    }}>
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: isFlipped ? 1 : 0.6, opacity: isFlipped ? 1 : 0 }}
                            transition={{ delay: 0.15, type: 'spring', damping: 14 }}
                            style={{ marginBottom: '1.25rem' }}
                        >
                            {isCorrect ? (
                                <div style={{
                                    padding: '1.25rem',
                                    borderRadius: '50%',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: '#10b981',
                                    display: 'inline-flex'
                                }}>
                                    <CheckCircle size={64} />
                                </div>
                            ) : (
                                <div style={{
                                    padding: '1.25rem',
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    color: '#ef4444',
                                    display: 'inline-flex'
                                }}>
                                    <XCircle size={64} />
                                </div>
                            )}
                        </motion.div>
                        
                        <h3 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            color: isCorrect ? '#10b981' : '#ef4444'
                        }}>
                            {isCorrect ? 'Spot On! Correct' : 'Not Quite'}
                        </h3>

                        {!isCorrect && (
                            <div style={{
                                marginTop: '1.25rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                background: 'var(--surface)',
                                border: '1px solid var(--card-border)',
                                padding: '1.25rem 1.5rem',
                                borderRadius: '1rem',
                                width: '100%',
                                maxWidth: '560px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                            }}>
                                <div style={{
                                    fontSize: '0.78rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: 'var(--text-muted)',
                                    marginBottom: '0.4rem',
                                    fontWeight: 600
                                }}>
                                    Correct Answer
                                </div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>
                                    <span style={{ color: '#10b981', marginRight: '0.5rem' }}>
                                        {alphabet[correctOptionIdx]}.
                                    </span>
                                    {currentQ.options[correctOptionIdx]}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleNextQuestion}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                maxWidth: '360px',
                                padding: '1rem 1.5rem',
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                marginTop: '1rem',
                                background: isCorrect
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                boxShadow: isCorrect
                                    ? '0 6px 20px rgba(16, 185, 129, 0.35)'
                                    : '0 6px 20px rgba(37, 99, 235, 0.35)',
                                borderRadius: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            {isLastQuestion ? `Finish ${terminology.assessment || 'Assessment'}` : 'Next Question'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AssessmentPage;

