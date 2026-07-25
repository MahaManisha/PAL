import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { Award, Lock, RefreshCw, AlertCircle, Trophy, Sparkles, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AchievementShowcase = ({ userId }) => {
    const { themeConfig, experience } = useTheme();
    const [catalog, setCatalog] = useState([]);
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAchievements = async (isManualRefresh = false) => {
        if (!userId) return;
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(false);

        try {
            const [catalogRes, userBadgesRes] = await Promise.all([
                apiClient.get('/api/achievements'),
                apiClient.get(`/api/achievements/user/${userId}`)
            ]);

            setCatalog(catalogRes.data || []);
            setUnlockedBadges(userBadgesRes.data?.unlockedBadges || []);
        } catch (err) {
            console.error('AchievementShowcase: Failed to load achievements', err);
            setError(true);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [userId]);

    // Theme-aware Title & Icon
    const getExperienceHeader = () => {
        if (experience === 'gamified') {
            return {
                title: 'Trophy Room',
                icon: <Trophy size={20} color="var(--primary)" />,
                badgeText: 'BADGES'
            };
        }
        if (experience === 'cinematic') {
            return {
                title: 'Hall of Fame',
                icon: <Sparkles size={20} color="var(--primary)" />,
                badgeText: 'ACCOLADES'
            };
        }
        // Professional
        return {
            title: 'Milestones & Badges',
            icon: <Award size={20} color="var(--primary)" />,
            badgeText: 'MILESTONES'
        };
    };

    const headerInfo = getExperienceHeader();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card micro-${themeConfig?.micro || 'slide'}`}
            style={{ padding: '1.5rem', marginBottom: '2rem' }}
        >
            {/* Header */}
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

                {/* Refresh Button */}
                <button
                    onClick={() => fetchAchievements(true)}
                    disabled={loading || isRefreshing}
                    title="Refresh Showcase"
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

            {/* Content Body */}
            {loading ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Loading badges & milestones...
                </div>
            ) : error ? (
                <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        <span>Unable to load achievements right now.</span>
                    </div>
                    <button
                        onClick={() => fetchAchievements(false)}
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
            ) : catalog.length === 0 ? (
                <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No achievements configured.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem'
                }}>
                    {catalog.map((item) => {
                        const matchingUnlocked = unlockedBadges.find(b => b.achievementKey === item.key);
                        const isUnlocked = !!matchingUnlocked;
                        const unlockedDate = matchingUnlocked ? formatDate(matchingUnlocked.unlockedAt) : '';

                        return (
                            <div
                                key={item.key}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    background: isUnlocked ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: isUnlocked ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--card-border)',
                                    opacity: isUnlocked ? 1 : 0.55,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    fontSize: '2rem',
                                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                    marginBottom: '0.2rem'
                                }}>
                                    {item.icon || '🏆'}
                                </div>
                                <div style={{ fontWeight: 700, color: isUnlocked ? 'var(--text)' : 'var(--text-muted)', fontSize: '0.92rem' }}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, flex: 1 }}>
                                    {item.description}
                                </div>

                                <div style={{ marginTop: '0.25rem', width: '100%' }}>
                                    {isUnlocked ? (
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            color: '#22c55e',
                                            background: 'rgba(34,197,94,0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '99px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            <Star size={11} fill="#22c55e" color="#22c55e" />
                                            {unlockedDate ? `Unlocked ${unlockedDate}` : 'Unlocked'}
                                        </span>
                                    ) : (
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            color: 'var(--text-muted)',
                                            background: 'var(--surface)',
                                            border: '1px solid var(--card-border)',
                                            padding: '2px 8px',
                                            borderRadius: '99px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            <Lock size={11} /> Locked
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default AchievementShowcase;
