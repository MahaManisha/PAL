import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Calendar, ArrowRight, BrainCircuit, CheckCircle, Zap, ChevronRight, Target, BookOpen, Play } from 'lucide-react';
import { useNextAction } from '../hooks/useNextAction';

const RevisionCenter = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [queue, setQueue] = useState({ dueNow: [], dueSoon: [], scheduledLater: [] });
    const [loading, setLoading] = useState(true);
    const { nextAction, isLoading: isLoadingNextAction } = useNextAction();
    
    useEffect(() => {
        const fetchRevisionQueue = async () => {
            if (!user?.id) return;
            try {
                const res = await apiClient.get(`/api/progress/revision-queue/${user.id}`);
                setQueue(res.data || { dueNow: [], dueSoon: [], scheduledLater: [] });
            } catch (err) {
                console.error("Failed to fetch revision queue", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRevisionQueue();
    }, [user?.id]);
    
    const { dueNow, dueSoon, scheduledLater } = queue;

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading Revision Center...</div>
            </div>
        );
    }

    const totalScheduled = dueNow.length + dueSoon.length + scheduledLater.length;

    // Helper to render a topic card
    const renderTopicCard = (record, type) => {
        const topic = record.topicId;
        const topicIdStr = topic?._id || topic?.id;
        const score = record.bestScore !== undefined ? record.bestScore : record.score;
        const isLowScore = score < 70;
        
        let icon, border, bg, color, label, actionText;
        if (type === 'dueNow') {
            icon = <AlertCircle size={16} />; border = '1px solid rgba(239,68,68,0.3)'; bg = 'rgba(239,68,68,0.05)'; color = '#ef4444'; label = 'Due Now'; actionText = 'Start Revision';
        } else if (type === 'dueSoon') {
            icon = <Clock size={16} />; border = '1px solid rgba(245,158,11,0.3)'; bg = 'rgba(245,158,11,0.05)'; color = '#f59e0b'; label = 'Due Soon'; actionText = 'Early Review';
        } else {
            icon = <Calendar size={16} />; border = '1px solid rgba(34,197,94,0.3)'; bg = 'rgba(34,197,94,0.05)'; color = '#22c55e'; label = 'Scheduled'; actionText = 'Practice Again';
        }

        const dateDisplay = record.nextRevisionDate ? new Date(record.nextRevisionDate).toLocaleDateString() : 'Overdue';

        return (
            <motion.div 
                key={record._id} 
                className="glass-card" 
                whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${color}` }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            {topic?.chapterId?.subjectId?.name || 'Study'}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                            {topic?.topicName || topic?.title || 'Unknown Topic'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Mastery: <strong style={{ color: isLowScore ? '#ef4444' : '#22c55e' }}>{Math.round(score || 0)}%</strong>
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Due: <strong>{dateDisplay}</strong>
                            </span>
                        </div>
                    </div>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                        background: bg, color, border
                    }}>
                        {icon} {label}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button 
                        onClick={() => navigate(`/practice?topicId=${topicIdStr}`)}
                        className={type === 'dueNow' ? 'btn btn-primary' : 'btn'}
                        style={{ 
                            flex: 1, padding: '0.6rem', fontSize: '0.9rem', fontWeight: 600,
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
                            ...(type !== 'dueNow' && { border: '1px solid var(--card-border)', background: 'var(--surface)', color: 'var(--text)' })
                        }}
                    >
                        {actionText} <ArrowRight size={16} />
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <BrainCircuit size={40} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Smart Revision Center</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Topics are intelligently scheduled using spaced repetition to maximize your long-term retention.
                </p>
            </div>

            {/* Next Best Action Banner */}
            {!isLoadingNextAction && nextAction && nextAction.type === 'REVISION' && (
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
                            <Target size={24} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Highest Priority
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
            {totalScheduled === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div style={{ width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#22c55e' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text)' }}>No revisions needed right now!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                        Learn or practice new topics. As you progress, our smart algorithm will schedule them for revision here at the optimal time.
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}>
                        Return to Dashboard
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    
                    {/* Due Now */}
                    {dueNow.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <AlertCircle size={22} color="#ef4444" />
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>Due Now</h2>
                                <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700 }}>{dueNow.length}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {dueNow.map(r => renderTopicCard(r, 'dueNow'))}
                            </div>
                        </div>
                    )}

                    {/* Due Soon */}
                    {dueSoon.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <Clock size={22} color="#f59e0b" />
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>Due Soon</h2>
                                <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700 }}>{dueSoon.length}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {dueSoon.map(r => renderTopicCard(r, 'dueSoon'))}
                            </div>
                        </div>
                    )}

                    {/* Scheduled Later */}
                    {scheduledLater.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <Calendar size={22} color="#22c55e" />
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>Scheduled Later</h2>
                                <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700 }}>{scheduledLater.length}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {scheduledLater.map(r => renderTopicCard(r, 'scheduledLater'))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RevisionCenter;
