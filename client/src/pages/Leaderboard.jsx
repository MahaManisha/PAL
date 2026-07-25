import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Flame, Book, ArrowLeft, RefreshCw, AlertCircle, User } from 'lucide-react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAvatarIcon, getFrameStyle } from '../config/cosmeticsConfig';

const Leaderboard = () => {
    const { user: authUser } = useContext(AuthContext);
    const { themeConfig, experience } = useTheme();

    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/api/leaderboard');
            setLeaderboardData(res.data);
        } catch (err) {
            console.error('Leaderboard: Failed to load data', err);
            setError(err.response?.data?.msg || 'Unable to load the leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Theme-aware presentation wording
    const getWording = () => {
        if (experience === 'gamified') {
            return {
                title: 'Champions Board',
                subtitle: 'Climb the ranks, earn points, and challenge the top learners.',
                pointsLabel: themeConfig?.reward?.label || 'Points',
                masteredLabel: 'Topics Cleared',
                streakLabel: 'Active Streak',
            };
        }
        if (experience === 'cinematic') {
            return {
                title: 'Hall of Fame',
                subtitle: 'See which learners are leading the story.',
                pointsLabel: 'Score',
                masteredLabel: 'Scenes Mastered',
                streakLabel: 'Days Active',
            };
        }
        return {
            title: 'Leaderboard',
            subtitle: 'See how your learning progress compares with other learners.',
            pointsLabel: 'Points',
            masteredLabel: 'Topics Mastered',
            streakLabel: 'Study Streak',
        };
    };

    const wording = getWording();
    const currentUserId = authUser?.id || authUser?._id;

    const list = leaderboardData?.leaderboard || [];
    const currentUserRankInfo = leaderboardData?.currentUser;
    const top3 = list.slice(0, 3);
    const remainingList = list.slice(3);

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', maxWidth: '1000px' }}>
            
            {/* ─── Top Navigation Bar ─── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <Link
                    to="/dashboard"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        color: 'var(--text-muted)', textDecoration: 'none',
                        fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>

            {/* ─── Hero Header ─── */}
            <motion.header
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '2.5rem' }}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        padding: '0.75rem', borderRadius: '1rem',
                        background: 'rgba(234, 179, 8, 0.12)', color: '#eab308',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Trophy size={28} />
                    </div>
                    <h1 className="heading-gradient" style={{ fontSize: '2.4rem', margin: 0, letterSpacing: '-0.02em' }}>
                        {wording.title}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
                    {wording.subtitle}
                </p>
            </motion.header>

            {/* ─── Error State ─── */}
            {error && !loading && (
                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto 2rem' }}>
                    <AlertCircle size={40} color="var(--error, #ef4444)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                        {error}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                        Please check your internet connection and try again.
                    </p>
                    <button
                        onClick={fetchLeaderboard}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem' }}
                    >
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            )}

            {/* ─── Loading Skeleton State ─── */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Hero card skeleton */}
                    <div className="glass-card" style={{ height: '100px', borderRadius: '1rem', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
                    {/* Top 3 skeleton */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div className="glass-card" style={{ height: '140px', borderRadius: '1rem', opacity: 0.4 }} />
                        <div className="glass-card" style={{ height: '160px', borderRadius: '1rem', opacity: 0.6 }} />
                        <div className="glass-card" style={{ height: '140px', borderRadius: '1rem', opacity: 0.4 }} />
                    </div>
                </div>
            )}

            {/* ─── Main Content when Loaded ─── */}
            {!loading && !error && (
                <>
                    {/* ─── Current User Rank Card ─── */}
                    {currentUserRankInfo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card"
                            style={{
                                padding: '1.5rem 2rem', marginBottom: '2.5rem',
                                borderRadius: '1.25rem',
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                                border: '1.5px solid rgba(59,130,246,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: '1.25rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div
                                    style={{
                                        width: '52px', height: '52px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.8rem', position: 'relative', flexShrink: 0,
                                        ...getFrameStyle(currentUserRankInfo.profileFrame)
                                    }}
                                >
                                    {getAvatarIcon(currentUserRankInfo.avatar)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        Your Standing
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        {currentUserRankInfo.name} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', padding: '2px 8px', borderRadius: '99px', background: 'rgba(59,130,246,0.15)' }}>(You)</span>
                                    </h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RANK</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                                        #{currentUserRankInfo.rank}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{wording.pointsLabel.toUpperCase()}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>
                                        {currentUserRankInfo.points}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{wording.masteredLabel.toUpperCase()}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>
                                        {currentUserRankInfo.masteredTopics}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── Empty State ─── */}
                    {list.length === 0 && (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <Trophy size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                                No leaderboard data available yet.
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                Start completing topic assessments to earn points and claim your place on the leaderboard!
                            </p>
                            <Link to="/dashboard" className="btn btn-primary">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* ─── Top 3 Podium Section ─── */}
                    {top3.length > 0 && (
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
                                🏆 Top Performers
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.25rem', alignItems: 'end'
                            }}>
                                {top3.map((entry, idx) => {
                                    const isSelf = entry.userId === currentUserId;
                                    const podiumConfig = [
                                        { rankText: '#1', title: 'Champion', icon: <Trophy size={24} color="#eab308" />, border: '2px solid rgba(234,179,8,0.5)', bg: 'rgba(234,179,8,0.08)', badgeBg: '#eab308' },
                                        { rankText: '#2', title: 'Runner Up', icon: <Medal size={22} color="#94a3b8" />, border: '2px solid rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.06)', badgeBg: '#94a3b8' },
                                        { rankText: '#3', title: 'Bronze Scholar', icon: <Award size={22} color="#b45309" />, border: '2px solid rgba(180,83,9,0.4)', bg: 'rgba(180,83,9,0.06)', badgeBg: '#b45309' }
                                    ][idx] || { rankText: `#${entry.rank}`, title: 'Top Learner', icon: <Star size={20} />, border: '1px solid var(--card-border)', bg: 'rgba(255,255,255,0.03)' };

                                    return (
                                        <motion.div
                                            key={entry.userId}
                                            whileHover={{ scale: 1.02 }}
                                            className="glass-card"
                                            style={{
                                                padding: '1.75rem 1.25rem', textAlign: 'center',
                                                borderRadius: '1.25rem',
                                                border: isSelf ? '2px solid var(--primary)' : podiumConfig.border,
                                                background: isSelf ? 'rgba(59,130,246,0.12)' : podiumConfig.bg,
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Rank Badge Header */}
                                            <div style={{
                                                position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                                                background: podiumConfig.badgeBg, color: '#ffffff',
                                                padding: '3px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.35rem'
                                            }}>
                                                {podiumConfig.icon} {podiumConfig.rankText}
                                            </div>

                                            {/* Avatar */}
                                            <div style={{
                                                width: '64px', height: '64px', borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.06)', margin: '1rem auto 0.75rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '2.2rem', position: 'relative',
                                                ...getFrameStyle(entry.profileFrame)
                                            }}>
                                                {getAvatarIcon(entry.avatar)}
                                            </div>

                                            {/* Name */}
                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text)' }}>
                                                {entry.name} {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>(You)</span>}
                                            </h3>

                                            {/* Points */}
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                                {entry.points} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{wording.pointsLabel}</span>
                                            </div>

                                            {/* Stats footer */}
                                            <div style={{
                                                display: 'flex', justifyContent: 'center', gap: '1rem',
                                                fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem'
                                            }}>
                                                <span>📚 <strong>{entry.masteredTopics}</strong> mastered</span>
                                                <span>🔥 <strong>{entry.streak}</strong> streak</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ─── Remaining Rankings List (4+) ─── */}
                    {remainingList.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
                                Full Rankings
                            </h2>
                            <div className="glass-card" style={{ padding: '0.5rem', borderRadius: '1rem', overflow: 'hidden' }}>
                                {remainingList.map((entry, index) => {
                                    const isSelf = entry.userId === currentUserId;

                                    return (
                                        <div
                                            key={entry.userId}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '0.9rem 1.25rem', borderRadius: '0.75rem',
                                                marginBottom: index === remainingList.length - 1 ? 0 : '0.25rem',
                                                background: isSelf ? 'rgba(59,130,246,0.12)' : index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                                border: isSelf ? '1px solid var(--primary)' : 'none',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            {/* Left side: Rank + Avatar + Name */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                                <span style={{
                                                    fontSize: '0.95rem', fontWeight: 800, width: '36px',
                                                    color: 'var(--text-muted)', flexShrink: 0
                                                }}>
                                                    #{entry.rank}
                                                </span>

                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.4rem', flexShrink: 0, position: 'relative',
                                                    ...getFrameStyle(entry.profileFrame)
                                                }}>
                                                    {getAvatarIcon(entry.avatar)}
                                                </div>

                                                <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <span style={{ fontWeight: isSelf ? 800 : 600, color: 'var(--text)', fontSize: '0.98rem' }}>
                                                        {entry.name}
                                                    </span>
                                                    {isSelf && (
                                                        <span style={{
                                                            marginLeft: '0.5rem', fontSize: '0.72rem', fontWeight: 700,
                                                            color: 'var(--primary)', padding: '1px 6px', borderRadius: '99px',
                                                            background: 'rgba(59,130,246,0.15)'
                                                        }}>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right side: Points & Mastered topics */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                                                        {entry.points} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>pts</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {entry.masteredTopics} mastered
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Leaderboard;
