import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, RefreshCw, Brain, Target, TrendingUp, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const WeakAreaPanel = ({ userId }) => {
    const { themeConfig, experience } = useTheme();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAnalytics = async (isManualRefresh = false) => {
        if (!userId) return;
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(false);

        try {
            const res = await apiClient.get(`/api/analytics/weak-areas/${userId}`);
            setAnalytics(res.data);
        } catch (err) {
            console.error('WeakAreaPanel: Failed to fetch analytics', err);
            setError(true);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [userId]);

    // Experience-aware Title and Icon
    const getExperienceHeader = () => {
        if (experience === 'gamified') {
            return {
                title: 'Weakness Scanner',
                icon: <Target size={20} color="var(--primary)" />,
                badgeText: 'RADAR'
            };
        }
        if (experience === 'cinematic') {
            return {
                title: 'Performance Review',
                icon: <TrendingUp size={20} color="var(--primary)" />,
                badgeText: 'SCENE REVISION'
            };
        }
        // Professional (default)
        return {
            title: 'Learning Insights',
            icon: <Brain size={20} color="var(--primary)" />,
            badgeText: 'ANALYTICS'
        };
    };

    const headerInfo = getExperienceHeader();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card micro-${themeConfig?.micro || 'slide'}`}
            style={{ padding: '1.5rem', marginBottom: '2rem' }}
        >
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {headerInfo.icon}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        {headerInfo.title}
                    </h3>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: 'rgba(99,102,241,0.15)',
                        color: 'var(--primary)',
                        letterSpacing: '0.05em'
                    }}>
                        {headerInfo.badgeText}
                    </span>
                </div>

                {/* Refetch / Refresh Button */}
                <button
                    onClick={() => fetchAnalytics(true)}
                    disabled={loading || isRefreshing}
                    title="Refresh Insights"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '0.5rem',
                        padding: '0.4rem 0.75rem',
                        color: 'var(--text-muted)',
                        cursor: loading || isRefreshing ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.82rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '0.9rem' }}>Loading performance insights...</div>
                </div>
            ) : error ? (
                <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        <span>Unable to load insights right now.</span>
                    </div>
                    <button
                        onClick={() => fetchAnalytics(false)}
                        style={{
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                            borderRadius: '0.4rem',
                            padding: '0.35rem 0.85rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : !analytics || analytics.totalWeakAreas === 0 ? (
                <div style={{
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(34,197,94,0.05)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <CheckCircle2 size={32} color="#22c55e" style={{ opacity: 0.8 }} />
                    <p style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                        No repeated weak areas detected from your recent assessments.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                        Keep completing topics and practice sets to track your progress!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {/* Preserves exact backend array order without any client-side sorting */}
                    {analytics.weakAreas.map((item, idx) => {
                        const isNeedsRevision = item.severity === 'NEEDS_REVISION';
                        const badgeBg = isNeedsRevision ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)';
                        const badgeBorder = isNeedsRevision ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(99,102,241,0.3)';
                        const badgeColor = isNeedsRevision ? '#ef4444' : 'var(--primary)';
                        const label = isNeedsRevision ? 'Needs Revision' : 'Review Suggested (Mastered)';
                        const icon = isNeedsRevision ? <AlertCircle size={14} color="#ef4444" /> : <CheckCircle2 size={14} color="#22c55e" />;

                        // Experience-aware CTA Wording
                        const getCtaLabel = () => {
                            if (experience === 'gamified') {
                                return isNeedsRevision ? 'Train This Skill' : 'Practice Again';
                            }
                            if (experience === 'cinematic') {
                                return 'Revisit Scene';
                            }
                            // Professional (default)
                            return isNeedsRevision ? 'Review Topic' : 'Optional Review';
                        };

                        return (
                            <div
                                key={`${item.conceptTag}-${item.topicId}-${idx}`}
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--card-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '0.75rem'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                                            {item.conceptTag}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            padding: '2px 8px',
                                            borderRadius: '99px',
                                            background: badgeBg,
                                            border: badgeBorder,
                                            color: badgeColor,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem'
                                        }}>
                                            {icon} {label}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {item.subjectName} &bull; {item.topicName}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)' }}>
                                        <strong style={{ color: 'var(--text)' }}>{item.mistakeCount} mistakes</strong> across {item.totalAttemptsEvaluated} recent attempts
                                    </div>
                                    <Link
                                        to={`/topic/${item.topicId}?tab=learn`}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            padding: '0.45rem 0.85rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            background: isNeedsRevision ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                                            border: isNeedsRevision ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(99,102,241,0.3)',
                                            color: isNeedsRevision ? '#ef4444' : 'var(--primary)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span>{getCtaLabel()}</span>
                                        <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default WeakAreaPanel;
