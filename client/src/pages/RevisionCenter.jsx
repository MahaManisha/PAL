import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, ArrowRight, BrainCircuit, CheckCircle, Zap, ChevronRight, Target, BookOpen, Play } from 'lucide-react';
import { TOPIC_THRESHOLDS, getEffectiveBestScore } from '../utils/progressionEngine';
import { useNextAction } from '../hooks/useNextAction';

const RevisionCenter = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [progressRecords, setProgressRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { nextAction, isLoading: isLoadingNextAction } = useNextAction();
    
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user?.id) return;
            try {
                const res = await apiClient.get(`/api/progress/${user.id}`);
                setProgressRecords(res.data || []);
            } catch (err) {
                console.error("Failed to fetch progress for Revision Center", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [user?.id]);
    
    // Process records
    const needsRevision = [];
    const recentlyStruggled = [];
    
    if (!loading && progressRecords.length > 0) {
        // Filter records that have a topicId populated
        const topicRecords = progressRecords.filter(p => p.topicId);
        
        topicRecords.forEach(record => {
            const score = getEffectiveBestScore(record);
            const isFailed = record.status === 'fail';
            const isLowScore = score !== null && score <= TOPIC_THRESHOLDS.MODERATE_MAX;
            
            if (isFailed || isLowScore) {
                needsRevision.push({ ...record, effectiveScore: score || 0 });
            }
        });
        
        // Sort by most recently updated for 'Recently Struggled' (taking top 3)
        // Ensure we handle timestamp or updatedAt
        const sortedByDate = [...needsRevision].sort((a, b) => {
            const dateA = new Date(a.updatedAt || Date.now());
            const dateB = new Date(b.updatedAt || Date.now());
            return dateB - dateA;
        });
        
        recentlyStruggled.push(...sortedByDate.slice(0, 3));
        
        // Sort needsRevision by lowest score first
        needsRevision.sort((a, b) => a.effectiveScore - b.effectiveScore);
    }
    
    const aiRecommendation = needsRevision.length > 0 ? needsRevision[0] : null;

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading Revision Center...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', color: '#ef4444', marginBottom: '1.5rem' }}>
                    <AlertCircle size={40} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Revision Center</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Review topics you've struggled with to strengthen your understanding and clear your learning path.
                </p>
            </div>

            {/* Next Best Action Banner */}
            {!isLoadingNextAction && nextAction && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card" 
                    style={{ 
                        padding: '1.5rem 2rem', 
                        marginBottom: '3rem', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {nextAction.type === 'REMEDIATION' ? <Zap size={24} color="#fff" /> : 
                             nextAction.type === 'CONTINUE' ? <BookOpen size={24} color="#fff" /> :
                             nextAction.type === 'REVIEW' ? <Target size={24} color="#fff" /> :
                             <Play size={24} color="#fff" />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Recommended Priority
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                {nextAction.topicName}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.95rem', maxWidth: '600px' }}>
                                {nextAction.reason}
                            </p>
                        </div>
                    </div>
                    <Link to={nextAction.destination} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {nextAction.ctaLabel} <ChevronRight size={18} />
                        </button>
                    </Link>
                </motion.div>
            )}

            {/* Content Section */}
            {needsRevision.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div style={{ width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#22c55e' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text)' }}>You're doing great!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                        No topics currently need revision. Your performance is solid across all tracked subjects. Keep up the excellent work!
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}>
                        Return to Dashboard
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {/* AI Recommendation Banner */}
                    {aiRecommendation && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: '1rem',
                                padding: '1.5rem 2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: '1rem'
                            }}
                        >
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Zap size={18} color="#6366f1" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6366f1', textTransform: 'uppercase' }}>AI Recommendation</span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                                    Focus on: {aiRecommendation.topicId.topicName || aiRecommendation.topicId.title}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                                    Your recent performance is below your usual level. We highly recommend reviewing this topic next.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => navigate(`/topic/${aiRecommendation.topicId._id || aiRecommendation.topicId.id}`)}
                                    className="btn"
                                    style={{ background: 'white', color: '#6366f1', border: '1px solid #6366f1', fontWeight: 600 }}
                                >
                                    Review Topic
                                </button>
                                <button 
                                    onClick={() => navigate(`/assessment/${aiRecommendation.topicId._id || aiRecommendation.topicId.id}`)}
                                    className="btn btn-primary"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontWeight: 600 }}
                                >
                                    Quick Practice
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {/* Needs Revision Section */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <AlertCircle size={20} color="#ef4444" />
                                <h2 style={{ fontSize: '1.4rem', color: 'var(--text)' }}>Needs Revision</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {needsRevision.map(record => (
                                    <motion.div 
                                        key={record._id} 
                                        className="glass-card" 
                                        whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                                        style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                                                    {record.topicId.topicName || record.topicId.title}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        Mastery Score: 
                                                    </span>
                                                    <span style={{ 
                                                        fontSize: '0.85rem', fontWeight: 700, 
                                                        color: record.effectiveScore < 40 ? '#ef4444' : '#eab308' 
                                                    }}>
                                                        {record.effectiveScore}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                                background: record.status === 'fail' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                                                color: record.status === 'fail' ? '#ef4444' : '#eab308'
                                            }}>
                                                {record.status === 'fail' ? 'Failed Assessment' : 'Low Mastery'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <button 
                                                onClick={() => navigate(`/topic/${record.topicId._id || record.topicId.id}`)}
                                                style={{ 
                                                    flex: 1, padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', 
                                                    background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                                                    transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                            >
                                                Review Now
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Recently Struggled Section */}
                        {recentlyStruggled.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <Clock size={20} color="#f97316" />
                                    <h2 style={{ fontSize: '1.4rem', color: 'var(--text)' }}>Recently Struggled</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recentlyStruggled.map(record => (
                                        <motion.div 
                                            key={`recent-${record._id}`} 
                                            className="glass-card" 
                                            style={{ padding: '1.25rem', borderLeft: '4px solid #f97316' }}
                                        >
                                            <h3 style={{ fontSize: '1.05rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                                                {record.topicId.topicName || record.topicId.title}
                                            </h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                                                You recently attempted this topic and scored lower than expected. A quick practice session can help solidify your understanding.
                                            </p>
                                            <button 
                                                onClick={() => navigate(`/assessment/${record.topicId._id || record.topicId.id}`)}
                                                style={{ 
                                                    padding: '0.5rem 1rem', borderRadius: '99px', border: 'none', 
                                                    background: 'rgba(249,115,22,0.1)', color: '#f97316', cursor: 'pointer', 
                                                    fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(249,115,22,0.2)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(249,115,22,0.1)'}
                                            >
                                                Start Practice <ArrowRight size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevisionCenter;
