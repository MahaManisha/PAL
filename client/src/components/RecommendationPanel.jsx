import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNextAction } from '../hooks/useNextAction';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
    AlertTriangle, 
    PlayCircle, 
    ArrowRightCircle, 
    CheckCircle2, 
    RotateCw, 
    Sparkles, 
    Compass, 
    BookOpen,
    Zap,
    RefreshCw
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

const getPanelTitle = (experience) => {
    if (experience === 'gamified') return 'Next Mission';
    if (experience === 'cinematic') return 'Next Scene';
    return 'Recommended Next Step';
};

const RecommendationPanel = ({ userId }) => {
    const { experience, themeConfig } = useTheme();
    
    const { nextAction, allRecommendations, isLoading, error, refreshAction } = useNextAction();

    const panelTitle = getPanelTitle(experience);
    const primary = nextAction;

    // Filter secondary recommendations to avoid duplicating the primary recommendation
    const secondaryList = allRecommendations.filter(rec => {
        if (!primary) return true;
        return !(rec.type === primary.type && rec.topicId === primary.topicId && rec.actionUrl === primary.actionUrl);
    });

    if (!userId) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header with Title and Accessible Refresh Control */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Compass size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                        {panelTitle}
                    </h3>
                </div>
                <button
                    onClick={refreshAction}
                    disabled={isLoading}
                    aria-label="Refresh recommendations"
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
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '90px', height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }} />
                        <div style={{ width: '70px', height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }} />
                    </div>
                    <div style={{ width: '60%', height: '28px', background: 'rgba(255,255,255,0.08)', borderRadius: '0.4rem', marginBottom: '0.75rem' }} />
                    <div style={{ width: '90%', height: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', marginBottom: '1.5rem' }} />
                    <div style={{ width: '140px', height: '38px', background: 'rgba(255,255,255,0.1)', borderRadius: '0.6rem' }} />
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
                    <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        {error}
                    </p>
                    <button
                        onClick={fetchRecommendations}
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

            {/* Empty State */}
            {!loading && !error && !primary && (
                <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Sparkles size={28} style={{ marginBottom: '0.5rem', color: 'var(--primary)', opacity: 0.8 }} />
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                        You're all caught up right now!
                    </p>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        Continue exploring your available learning content.
                    </p>
                </div>
            )}

            {/* Primary Recommendation Hero Card */}
            {!loading && !error && primary && (() => {
                const labels = getExperienceLabels(experience, primary.type, primary.actionTab, primary.isMastered);
                
                // Urgency presentation
                let urgencyBg = 'rgba(99,102,241,0.12)';
                let urgencyBorder = 'rgba(99,102,241,0.3)';
                let urgencyColor = 'var(--primary)';
                if (primary.urgency === 'HIGH') {
                    urgencyBg = 'rgba(245,158,11,0.15)';
                    urgencyBorder = 'rgba(245,158,11,0.4)';
                    urgencyColor = '#f59e0b';
                } else if (primary.urgency === 'LOW') {
                    urgencyBg = 'rgba(34,197,94,0.12)';
                    urgencyBorder = 'rgba(34,197,94,0.3)';
                    urgencyColor = '#22c55e';
                }

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            padding: '1.75rem',
                            borderRadius: '1rem',
                            border: primary.urgency === 'HIGH' ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--card-border)',
                            boxShadow: primary.urgency === 'HIGH' ? '0 0 20px rgba(245,158,11,0.1)' : 'none',
                            position: 'relative'
                        }}
                    >
                        {/* Badges Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {/* Type Badge */}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '9999px',
                                background: urgencyBg,
                                border: `1px solid ${urgencyBorder}`,
                                color: urgencyColor,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                {labels.icon}
                                {labels.label}
                            </span>

                            {/* Urgency Text Badge */}
                            <span style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '9999px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--card-border)',
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                Urgency: {primary.urgency}
                            </span>

                            {/* Mastered Badge (Safely preserved for REVIEW) */}
                            {primary.isMastered && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '9999px',
                                    background: 'rgba(34,197,94,0.15)',
                                    border: '1px solid rgba(34,197,94,0.3)',
                                    color: '#22c55e',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    ✓ Mastered
                                </span>
                            )}
                        </div>

                        {/* Topic Title & Hierarchy */}
                        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.35rem', wordBreak: 'break-word' }}>
                            {primary.topicName}
                        </h2>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.85rem' }}>
                            {primary.subjectName} · {primary.chapterName}
                        </p>

                        {/* Concept Tag Pill (rendered only if conceptTag is non-null & non-empty) */}
                        {primary.conceptTag && (
                            <div style={{ marginBottom: '0.85rem' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '0.4rem',
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                    color: 'var(--primary)',
                                    fontSize: '0.82rem',
                                    fontWeight: 600
                                }}>
                                    Target Concept: {primary.conceptTag}
                                </span>
                            </div>
                        )}

                        {/* Backend Reason String */}
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            {primary.reason}
                        </p>

                        {/* Action CTA Link */}
                        <Link
                            to={primary.actionUrl}
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn btn-primary"
                                style={{
                                    padding: '0.75rem 1.4rem',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    borderRadius: '0.65rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>{labels.cta}</span>
                                <ArrowRightCircle size={16} />
                            </motion.button>
                        </Link>
                    </motion.div>
                );
            })()}

            {/* Secondary Recommendations Section */}
            {!loading && !error && secondaryList.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                        Other Recommended Actions
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        {secondaryList.map((rec, index) => {
                            const secLabels = getExperienceLabels(experience, rec.type, rec.actionTab, rec.isMastered);
                            return (
                                <div
                                    key={`${rec.type}-${rec.topicId}-${index}`}
                                    className="glass-card"
                                    style={{
                                        padding: '1.1rem 1.25rem',
                                        borderRadius: '0.85rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                                {secLabels.label}
                                            </span>
                                            {rec.isMastered && (
                                                <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>✓ Mastered</span>
                                            )}
                                        </div>
                                        <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.25rem 0' }}>
                                            {rec.topicName}
                                        </h5>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                            {rec.subjectName}
                                        </p>
                                    </div>
                                    <Link to={rec.actionUrl} style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                                        <span style={{
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem'
                                        }}>
                                            {secLabels.cta} →
                                        </span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationPanel;
