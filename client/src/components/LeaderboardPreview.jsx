import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Award } from 'lucide-react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LeaderboardPreview = () => {
    const { user } = useContext(AuthContext);
    const { themeConfig, experience } = useTheme();

    const [rankData, setRankData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchPreview = async () => {
            try {
                const res = await apiClient.get('/api/leaderboard');
                setRankData(res.data?.currentUser || null);
            } catch (err) {
                console.error('LeaderboardPreview: Error loading rank preview', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPreview();
    }, [user]);

    const getTitle = () => {
        if (experience === 'gamified') return 'Champions Board';
        if (experience === 'cinematic') return 'Hall of Fame';
        return 'Leaderboard';
    };

    const title = getTitle();
    const pointsLabel = themeConfig?.reward?.label || 'Points';

    return (
        <motion.div className="glass-card" style={{ padding: '1.5rem' }} whileHover={{ scale: 1.01 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(234, 179, 8, 0.12)', color: '#eab308' }}>
                    <Trophy size={18} />
                </div>
                <h3 style={{ color: 'var(--text)', fontSize: '1rem', margin: 0 }}>{title}</h3>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>Loading rank…</div>
            ) : rankData ? (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>YOUR RANK</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>#{rankData.rank}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
                        {rankData.points} {pointsLabel} · {rankData.masteredTopics} Mastered
                    </p>
                </div>
            ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Compare your progress with other learners!
                </p>
            )}

            <Link
                to="/leaderboard"
                className="btn"
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: '0.6rem', borderRadius: '0.75rem',
                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                    color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                    transition: 'all 0.2s'
                }}
            >
                View Full {title} <ChevronRight size={15} />
            </Link>
        </motion.div>
    );
};

export default LeaderboardPreview;
