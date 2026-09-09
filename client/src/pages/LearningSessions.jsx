import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Clock, Target, CheckCircle, XCircle, Award, ChevronDown, ChevronUp, Zap, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const LearningSessions = () => {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState(null);

    // Filters
    const [subjectFilter, setSubjectFilter] = useState('All');
    
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await apiClient.get('/api/sessions/history');
                setSessions(res.data);
            } catch (err) {
                console.error("Failed to load sessions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    // Derived Insights
    const totalSessions = sessions.length;
    const thisWeek = sessions.filter(s => new Date(s.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    const avgAccuracy = sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) : 0;
    
    // Get unique subjects for filter
    const subjects = ['All', ...new Set(sessions.map(s => s.subjectName).filter(Boolean))];
    const filteredSessions = subjectFilter === 'All' ? sessions : sessions.filter(s => s.subjectName === subjectFilter);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center', minHeight: '80vh' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading session history...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History</span>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>Learning Sessions</h1>
                </div>
            </div>

            {/* AI Insight Banner */}
            {totalSessions > 0 && (
                <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Zap size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>AI Study Insight</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            You have completed <strong>{thisWeek} focused sessions</strong> this week with an overall accuracy of <strong>{avgAccuracy}%</strong>. 
                            {avgAccuracy >= 80 ? ' Excellent retention!' : ' Keep practicing to improve mastery.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            {totalSessions > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Filter size={20} color="var(--text-muted)" />
                    <select 
                        value={subjectFilter} 
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}

            {/* Session List */}
            {filteredSessions.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)' }}>No learning sessions yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Complete a Focus Session from your Dashboard to see your history here.</p>
                    <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Go to Dashboard</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredSessions.map((session) => {
                        const isExpanded = expandedSession === session._id;
                        return (
                            <div key={session._id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                {/* Card Header (Clickable) */}
                                <div 
                                    onClick={() => setExpandedSession(isExpanded ? null : session._id)}
                                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{session.subjectName}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12}/> {formatDate(session.completedAt)}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{session.topicName}</h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: session.accuracy >= 70 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                            <Target size={18} /> {Math.round(session.accuracy)}%
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} color="var(--text-muted)"/> : <ChevronDown size={20} color="var(--text-muted)"/>}
                                    </div>
                                </div>

                                {/* Card Body (Expanded) */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid var(--card-border)' }}>
                                                
                                                {/* Stats Grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><Clock size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Duration</div>
                                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatTime(session.durationSeconds)}</div>
                                                    </div>
                                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Correct</div>
                                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{session.correctAnswers} / {session.questionsAttempted}</div>
                                                    </div>
                                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><Award size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> XP Earned</div>
                                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>+{session.xpEarned}</div>
                                                    </div>
                                                </div>

                                                {/* Mistakes Review */}
                                                {session.mistakes && session.mistakes.length > 0 && (
                                                    <div>
                                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Areas to Review</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {session.mistakes.map((m, idx) => (
                                                                <div key={idx} style={{ background: 'rgba(239,68,68,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                                                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>{m.questionText}</p>
                                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                                                        <span style={{ color: '#ef4444' }}><XCircle size={12} style={{ display: 'inline' }}/> Your Answer: {m.selectedOption !== undefined && m.selectedOption !== null ? String.fromCharCode(65 + m.selectedOption) : 'N/A'}</span>
                                                                        <span style={{ color: '#22c55e' }}><CheckCircle size={12} style={{ display: 'inline' }}/> Correct: {m.correctOption !== undefined && m.correctOption !== null ? String.fromCharCode(65 + m.correctOption) : 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LearningSessions;
