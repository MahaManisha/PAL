import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Zap, AlertCircle } from 'lucide-react';

const AdaptivePathResultPage = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [progress, setProgress] = useState(null);
    const [firstTopic, setFirstTopic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgressAndTopics = async () => {
            try {
                const res = await apiClient.get(`/api/progress/chapter/${user.id || user._id}/${chapterId}`);
                setProgress(res.data);

                // Fetch topics for this chapter to direct WEAK students to micro content
                const topicsRes = await apiClient.get(`/api/topics/${chapterId}`);
                const topicsList = Array.isArray(topicsRes.data) ? topicsRes.data : [];
                if (topicsList.length > 0) {
                    setFirstTopic(topicsList[0]);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        if (user) fetchProgressAndTopics();
    }, [chapterId, user]);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading results...</div>;

    if (!progress || !progress.currentLevel || progress.currentLevel === 'PENDING') {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <AlertCircle size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
                <h2>No Assessment Results Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please complete the initial assessment first.</p>
                <button className="btn btn-primary" onClick={() => navigate(`/chapter/${chapterId}/initial-assessment`)}>
                    Take Assessment
                </button>
            </div>
        );
    }

    const levelColors = {
        WEAK: '#ef4444',
        LOW: '#ef4444',
        MEDIUM: '#eab308',
        HIGH: '#22c55e'
    };

    const levelLabels = {
        WEAK: 'WEAK (Remediation Path)',
        LOW: 'WEAK (Remediation Path)',
        MEDIUM: 'MEDIUM (Guided Practice Path)',
        HIGH: 'HIGH (Direct Mastery Path)'
    };

    const studentLevel = progress.currentLevel || 'MEDIUM';
    const activeColor = levelColors[studentLevel] || '#eab308';
    const activeLabel = levelLabels[studentLevel] || studentLevel;

    const handleContinue = () => {
        if (progress.pathType === 'DIRECT_MAIN_CONTENT') {
            navigate(`/slides/${chapterId}/main`);
        } else if (firstTopic) {
            // WEAK or MEDIUM Category -> Route directly to Topic Micro-Content (PPTs & Videos)
            const topicIdStr = firstTopic._id || firstTopic.id;
            navigate(`/topic/${topicIdStr}?tab=learn`);
        } else {
            navigate(`/dashboard`);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '5rem', maxWidth: '850px', margin: '0 auto', textAlign: 'center', paddingBottom: '4rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '3.5rem 2.5rem', borderRadius: '1.5rem' }}>
                <Target size={64} style={{ margin: '0 auto 1.25rem', color: activeColor }} />
                
                <h1 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Assessment Complete!</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
                    Your assessment has been evaluated using the Adaptive Categorization Algorithm.
                </p>

                {/* Score & Category Display Card */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    margin: '1.5rem 0 2.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.75rem',
                    borderRadius: '1.25rem',
                    border: '1px solid var(--card-border)'
                }}>
                    {/* Score Panel */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: 700 }}>
                            Calculated Score
                        </p>
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
                            {progress.initialAssessmentScore !== undefined ? Math.round(progress.initialAssessmentScore) : Math.round(progress.score || 0)}
                            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>%</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.35rem' }}>
                            Score = (Correct / Total) × 100
                        </p>
                    </div>

                    {/* Category Panel */}
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.78rem', marginBottom: '0.6rem', fontWeight: 700 }}>
                            Student Category
                        </p>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.55rem', 
                            padding: '0.65rem 1.6rem', 
                            background: `${activeColor}22`,
                            border: `2px solid ${activeColor}`,
                            borderRadius: '999px',
                            color: activeColor,
                            fontWeight: 800,
                            fontSize: '1.35rem',
                            boxShadow: `0 0 20px ${activeColor}33`
                        }}>
                            <Zap size={22} />
                            {studentLevel === 'LOW' ? 'WEAK' : studentLevel}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            {activeLabel}
                        </span>
                    </div>
                </div>

                {/* Algorithm Category Rules Card */}
                <div style={{
                    textAlign: 'left',
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '2.5rem'
                }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📐 Algorithm Classification Thresholds:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: studentLevel === 'WEAK' || studentLevel === 'LOW' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)', border: studentLevel === 'WEAK' || studentLevel === 'LOW' ? '1px solid #ef4444' : 'none' }}>
                            <strong style={{ color: '#ef4444' }}>🔴 WEAK:</strong> Score &lt; 40%<br />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Foundational Remediation Path</span>
                        </div>
                        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: studentLevel === 'MEDIUM' ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.04)', border: studentLevel === 'MEDIUM' ? '1px solid #eab308' : 'none' }}>
                            <strong style={{ color: '#eab308' }}>🟡 MEDIUM:</strong> 40% ≤ Score &lt; 70%<br />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Guided Practice Learning Path</span>
                        </div>
                        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: studentLevel === 'HIGH' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)', border: studentLevel === 'HIGH' ? '1px solid #22c55e' : 'none' }}>
                            <strong style={{ color: '#22c55e' }}>🟢 HIGH:</strong> Score ≥ 70%<br />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Fast-Track Main Chapter Path</span>
                        </div>
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                    {progress.pathType === 'DIRECT_MAIN_CONTENT' 
                        ? "Outstanding! You scored in the HIGH category. We've unlocked the Main Chapter content for you."
                        : (studentLevel === 'WEAK' || studentLevel === 'LOW')
                        ? "Based on your score, you've been placed in the WEAK category. We've created a step-by-step foundational remediation path to help you master key concepts."
                        : "Great effort! You are in the MEDIUM category. We've prepared a guided practice path to help you reinforce your understanding."}
                </p>

                <motion.button 
                    className="btn btn-primary" 
                    onClick={handleContinue}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}
                >
                    Start Your Personalized Path <ArrowRight size={20} />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default AdaptivePathResultPage;
