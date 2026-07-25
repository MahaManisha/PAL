import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
    Calendar, 
    AlertTriangle, 
    PlayCircle, 
    ArrowRightCircle, 
    CheckCircle2, 
    RotateCw, 
    Sparkles, 
    ChevronDown 
} from 'lucide-react';

const getExperienceLabels = (experience, type, actionTab, isMastered) => {
    if (type === 'REMEDIATION') {
        let label = 'Needs Attention';
        if (experience === 'gamified') label = 'Skill Recovery';
        if (experience === 'cinematic') label = 'Scene to Revisit';
        return { label, cta: 'Review Weak Concept', icon: <AlertTriangle size={15} /> };
    }

    if (type === 'CONTINUE') {
        let label = 'Continue Learning';
        if (experience === 'gamified') label = 'Resume Mission';
        if (experience === 'cinematic') label = 'Continue Story';

        let cta = 'Continue Learning';
        if (actionTab === 'practice') cta = 'Continue Practice';
        if (actionTab === 'assessment') cta = 'Take Assessment';

        return { label, cta, icon: <PlayCircle size={15} /> };
    }

    if (type === 'NEXT_TOPIC') {
        let label = 'Up Next';
        if (experience === 'gamified') label = 'Next Quest';
        if (experience === 'cinematic') label = 'Coming Up';
        return { label, cta: 'Start Topic', icon: <ArrowRightCircle size={15} /> };
    }

    if (type === 'REVIEW') {
        let label = 'Optional Review';
        if (experience === 'gamified') label = 'Bonus Practice';
        if (experience === 'cinematic') label = 'Replay Suggested';
        return { label, cta: 'Optional Review', icon: <CheckCircle2 size={15} color="#22c55e" /> };
    }

    return { label: 'Recommended', cta: 'View Topic', icon: <Sparkles size={15} /> };
};

const getWidgetTitle = (experience) => {
    if (experience === 'gamified') return "Today's Missions";
    if (experience === 'cinematic') return "Today's Storyline";
    return "Today's Study Plan";
};

const StudyPlanWidget = ({ userId }) => {
    const { experience } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudyPlan = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/api/study-plan/${userId}`);
            setData(res.data);
        } catch (err) {
            console.error('StudyPlanWidget fetch error:', err);
            setError(err.response?.data?.msg || "Unable to load today's study plan.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchStudyPlan();
    }, [fetchStudyPlan]);

    const widgetTitle = getWidgetTitle(experience);
    const items = data?.items || [];

    if (!userId) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header with Title and Accessible Refresh Control */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                        {widgetTitle}
                    </h3>
                </div>
                <button
                    onClick={fetchStudyPlan}
                    disabled={loading}
                    aria-label="Refresh study plan"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '0.5rem',
                        padding: '0.4rem 0.65rem',
                        cursor: loading ? 'default' : 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    <RotateCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: '80%', height: '18px', background: 'rgba(255,255,255,0.06)', borderRadius: '0.4rem', marginBottom: '1.5rem' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{ width: '100%', height: '70px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
                    <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        {error}
                    </p>
                    <button
                        onClick={fetchStudyPlan}
                        style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '0.5rem',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 600
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty State (0 items) */}
            {!loading && !error && items.length === 0 && (
                <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Sparkles size={28} style={{ marginBottom: '0.5rem', color: 'var(--primary)', opacity: 0.8 }} />
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                        You're all caught up with your current recommended learning actions.
                    </p>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        Continue exploring your available learning content.
                    </p>
                </div>
            )}

            {/* Plan Sequence Container */}
            {!loading && !error && items.length > 0 && (
                <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                    {/* Summary Banner */}
                    {data?.summary && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '0.6rem',
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            color: 'var(--text)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            lineHeight: 1.5,
                            marginBottom: '1.25rem'
                        }}>
                            📋 {data.summary}
                        </div>
                    )}

                    {/* Sequential Plan Items Map (Preserves Backend Order Exactly) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {items.map((item, index) => {
                            const labels = getExperienceLabels(experience, item.type, item.actionTab, item.isMastered);

                            let urgencyBg = 'rgba(99,102,241,0.12)';
                            let urgencyBorder = 'rgba(99,102,241,0.3)';
                            let urgencyColor = 'var(--primary)';
                            if (item.urgency === 'HIGH') {
                                urgencyBg = 'rgba(245,158,11,0.15)';
                                urgencyBorder = 'rgba(245,158,11,0.4)';
                                urgencyColor = '#f59e0b';
                            } else if (item.urgency === 'LOW') {
                                urgencyBg = 'rgba(34,197,94,0.12)';
                                urgencyBorder = 'rgba(34,197,94,0.3)';
                                urgencyColor = '#22c55e';
                            }

                            return (
                                <React.Fragment key={`${item.type}-${item.topicId}-${index}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            padding: '1.1rem 1.25rem',
                                            borderRadius: '0.85rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: item.urgency === 'HIGH' ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--card-border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        {/* Step Number + Type Badge + Urgency */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    padding: '0.2rem 0.55rem',
                                                    borderRadius: '0.4rem',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    color: 'var(--text)'
                                                }}>
                                                    Step {item.step || index + 1}
                                                </span>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '9999px',
                                                    background: urgencyBg,
                                                    border: `1px solid ${urgencyBorder}`,
                                                    color: urgencyColor,
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.03em'
                                                }}>
                                                    {labels.icon}
                                                    {labels.label}
                                                </span>
                                                {item.isMastered && (
                                                    <span style={{
                                                        padding: '0.15rem 0.55rem',
                                                        borderRadius: '9999px',
                                                        background: 'rgba(34,197,94,0.15)',
                                                        border: '1px solid rgba(34,197,94,0.3)',
                                                        color: '#22c55e',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700
                                                    }}>
                                                        ✓ Mastered
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                Urgency: {item.urgency}
                                            </span>
                                        </div>

                                        {/* Topic & Subject/Chapter */}
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.2rem 0', wordBreak: 'break-word' }}>
                                                {item.topicName}
                                            </h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>
                                                {item.subjectName} · {item.chapterName}
                                            </p>
                                        </div>

                                        {/* Target Concept Tag Pill (if present) */}
                                        {item.conceptTag && (
                                            <div>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.2rem 0.55rem',
                                                    borderRadius: '0.4rem',
                                                    background: 'rgba(99,102,241,0.12)',
                                                    border: '1px solid rgba(99,102,241,0.25)',
                                                    color: 'var(--primary)',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600
                                                }}>
                                                    Target Concept: {item.conceptTag}
                                                </span>
                                            </div>
                                        )}

                                        {/* Reason Text */}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                                            {item.reason}
                                        </p>

                                        {/* Action Link CTA */}
                                        <div style={{ marginTop: '0.25rem' }}>
                                            <Link to={item.actionUrl} style={{ textDecoration: 'none', display: 'inline-block' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="btn btn-primary"
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.84rem',
                                                        fontWeight: 700,
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem'
                                                    }}
                                                >
                                                    <span>{labels.cta}</span>
                                                    <ArrowRightCircle size={14} />
                                                </motion.button>
                                            </Link>
                                        </div>
                                    </motion.div>

                                    {/* Connector Arrow (Rendered ONLY between items) */}
                                    {index < items.length - 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.15rem 0', color: 'var(--primary)', opacity: 0.6 }}>
                                            <ChevronDown size={18} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlanWidget;
