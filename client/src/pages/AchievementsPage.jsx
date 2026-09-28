import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Trophy, Zap, Map, Star, RefreshCw, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AchievementsPage = () => {
    const { user } = useContext(AuthContext);
    const { themeConfig, experience } = useTheme();
    const [catalog, setCatalog] = useState([]);
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [progressStats, setProgressStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAchievements = async (isManualRefresh = false) => {
        if (!user || !user.id) return;
        if (isManualRefresh) setIsRefreshing(true);
        else setLoading(true);
        setError(false);

        try {
            const [catalogRes, userBadgesRes] = await Promise.all([
                apiClient.get('/api/achievements'),
                apiClient.get(`/api/achievements/user/${user.id}`)
            ]);

            setCatalog(catalogRes.data || []);
            setUnlockedBadges(userBadgesRes.data?.unlockedBadges || []);
            setProgressStats(userBadgesRes.data?.progressStats || { passedTopicsCount: 0, streak: 0 });
        } catch (err) {
            console.error('Failed to load achievements', err);
            setError(true);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchAchievements();
        }
    }, [user]);

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

    // Calculate current progress for a given badge category & threshold
    const getBadgeProgress = (item) => {
        let current = 0;
        if (item.category === 'mastery') {
            current = progressStats.passedTopicsCount || 0;
        } else if (item.category === 'streak') {
            current = progressStats.streak || 0;
        } else if (item.category === 'performance') {
            // Since performance is typically 100% on any, we don't have a numeric cumulative stat.
            // Just treat it as binary based on unlock.
            return null;
        }
        
        return {
            current: Math.min(current, item.threshold),
            total: item.threshold,
            percentage: Math.min((current / item.threshold) * 100, 100)
        };
    };

    const groupedCatalog = catalog.reduce((acc, item) => {
        const cat = item.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categoryIcons = {
        mastery: <Map size={18} />,
        streak: <Zap size={18} />,
        performance: <Trophy size={18} />,
        other: <Award size={18} />
    };

    const getExperienceHeader = () => {
        if (experience === 'gamified') return { title: 'Trophy Room', icon: <Trophy size={28} color="var(--primary)" /> };
        if (experience === 'cinematic') return { title: 'Hall of Fame', icon: <Star size={28} color="var(--primary)" /> };
        return { title: 'Milestones & Badges', icon: <Award size={28} color="var(--primary)" /> };
    };

    const headerInfo = getExperienceHeader();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(99,102,241,0.1)',
                        borderRadius: '12px',
                        display: 'flex'
                    }}>
                        {headerInfo.icon}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                            {headerInfo.title}
                        </h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Track your learning milestones and unlock rewards.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => fetchAchievements(true)}
                    disabled={loading || isRefreshing}
                    className="glass-card"
                    style={{
                        padding: '0.6rem 1rem',
                        cursor: loading || isRefreshing ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        border: '1px solid var(--card-border)',
                        background: 'var(--surface)',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                    <span>Refresh</span>
                </button>
            </motion.div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '3px solid rgba(99,102,241,0.3)', borderTopColor: 'var(--primary)',
                        animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto'
                    }} />
                    Loading achievements...
                </div>
            ) : error ? (
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '1rem',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertCircle size={24} />
                    <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700 }}>Unable to load</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Please try again later.</p>
                    </div>
                </div>
            ) : catalog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No achievements available right now.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {Object.entries(groupedCatalog).map(([category, items]) => (
                        <div key={category}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text)',
                                textTransform: 'capitalize',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1.25rem',
                                paddingBottom: '0.5rem',
                                borderBottom: '1px solid var(--card-border)'
                            }}>
                                {categoryIcons[category] || categoryIcons.other}
                                {category}
                            </h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {items.map((item, idx) => {
                                    const matchingUnlocked = unlockedBadges.find(b => b.achievementKey === item.key);
                                    const isUnlocked = !!matchingUnlocked;
                                    const unlockedDate = matchingUnlocked ? formatDate(matchingUnlocked.unlockedAt) : '';
                                    const progress = getBadgeProgress(item);

                                    return (
                                        <motion.div
                                            key={item.key}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="glass-card"
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                background: isUnlocked ? 'rgba(99,102,241,0.04)' : 'var(--surface)',
                                                border: isUnlocked ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--card-border)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Top Section */}
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{
                                                    fontSize: '2.5rem',
                                                    filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '60px',
                                                    height: '60px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: '1rem',
                                                    border: '1px solid var(--card-border)'
                                                }}>
                                                    {item.icon || '🏆'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: isUnlocked ? 'var(--text)' : 'var(--text-muted)' }}>
                                                        {item.name}
                                                    </h3>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bottom Section (Status & Progress) */}
                                            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                                {isUnlocked ? (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        background: 'rgba(34,197,94,0.1)',
                                                        color: '#22c55e',
                                                        padding: '0.5rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700
                                                    }}>
                                                        <Star size={14} fill="#22c55e" />
                                                        {unlockedDate ? `Unlocked ${unlockedDate}` : 'Unlocked'}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {progress ? (
                                                            <>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                                                    <span>Progress</span>
                                                                    <span>{progress.current} / {progress.total}</span>
                                                                </div>
                                                                <div style={{
                                                                    height: '6px',
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    borderRadius: '3px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        height: '100%',
                                                                        width: `${progress.percentage}%`,
                                                                        background: 'var(--primary)',
                                                                        borderRadius: '3px',
                                                                        transition: 'width 0.5s ease'
                                                                    }} />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                color: 'var(--text-muted)',
                                                                padding: '0.5rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600
                                                            }}>
                                                                <Lock size={14} /> Locked
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AchievementsPage;
