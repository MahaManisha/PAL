import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, CheckCircle2, Circle, ChevronRight, Zap, RefreshCw, Star, Trophy } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';

const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
};

const DailyMissionCard = ({ userId, progress, dailyQuest, onQuestClick }) => {
    const { experience, themeConfig } = useTheme();
    const [recData, setRecData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRecommendations = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get(`/api/recommendations/${userId}`);
            setRecData(res.data);
        } catch (err) {
            console.error('Failed to load mission recommendations:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Derived State
    const tasks = useMemo(() => {
        if (!userId) return [];
        const taskList = [];

        // Task 1: Primary Recommendation
        const primary = recData?.primaryRecommendation;
        if (primary) {
            // Check if user made progress on this topic today
            const topicProgress = progress.find(p => p.topicId === primary.topicId || (p.topicId && p.topicId._id === primary.topicId));
            const primaryCompleted = topicProgress ? isToday(topicProgress.updatedAt) : false;
            
            let title = `Learn: ${primary.topicName}`;
            if (primary.type === 'REMEDIATION') title = `Review: ${primary.topicName}`;
            if (primary.actionTab === 'practice') title = `Practice: ${primary.topicName}`;
            if (primary.actionTab === 'assessment') title = `Assess: ${primary.topicName}`;

            taskList.push({
                id: 'primary_rec',
                title: title,
                isCompleted: primaryCompleted,
                actionUrl: primary.actionUrl,
                actionType: 'link'
            });
        } else if (!loading) {
            // Fallback if no primary recommendation
            taskList.push({
                id: 'primary_fallback',
                title: 'Explore a new topic',
                isCompleted: false,
                actionUrl: '/roadmap',
                actionType: 'link'
            });
        }

        // Task 2: Practice Task
        let practicedToday = false;
        progress.forEach(p => {
            if (p.attempts && p.attempts.some(a => isToday(a.timestamp))) {
                practicedToday = true;
            }
        });
        
        taskList.push({
            id: 'practice_task',
            title: 'Complete a practice session',
            isCompleted: practicedToday,
            actionUrl: '/roadmap', // They can go to roadmap to find practice
            actionType: 'link'
        });

        // Task 3: Daily Quest
        if (dailyQuest) {
            taskList.push({
                id: 'daily_quest',
                title: 'Complete Daily Assessment',
                isCompleted: dailyQuest.alreadyCompleted,
                actionType: 'button',
                onClick: onQuestClick
            });
        }

        return taskList;
    }, [recData, loading, userId, progress, dailyQuest, onQuestClick]);

    if (!userId) return null;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
    const rewardValue = 50; // Arbitrary XP reward for full mission

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ 
                padding: '1.5rem', 
                position: 'relative', 
                overflow: 'hidden',
                border: allCompleted ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--card-border)'
            }}
        >
            {/* Background completion glow */}
            {allCompleted && (
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(34,197,94,0.15), transparent 60%)', pointerEvents: 'none' }} />
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: allCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', borderRadius: '0.75rem', color: allCompleted ? '#22c55e' : 'var(--primary)' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                                Today's Mission
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.1rem' }}>
                                {completedTasks} / {totalTasks} Completed
                            </p>
                        </div>
                    </div>
                    {/* Refresh button */}
                    <button 
                        onClick={fetchRecommendations} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '99px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{ 
                            height: '100%', 
                            background: allCompleted ? '#22c55e' : 'var(--primary)', 
                            borderRadius: '99px' 
                        }} 
                    />
                </div>

                {/* Task List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {loading && tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Generating your mission...
                        </div>
                    ) : (
                        tasks.map((task) => {
                            const isDone = task.isCompleted;
                            
                            const innerContent = (
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                    padding: '0.85rem 1rem', 
                                    background: isDone ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.03)',
                                    border: isDone ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--card-border)',
                                    borderRadius: '0.75rem',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{ color: isDone ? '#22c55e' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </div>
                                    <span style={{ 
                                        flex: 1, fontSize: '0.9rem', fontWeight: 600, 
                                        color: isDone ? 'var(--text-muted)' : 'var(--text)',
                                        textDecoration: isDone ? 'line-through' : 'none',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {task.title}
                                    </span>
                                    {!isDone && <ChevronRight size={16} color="var(--primary)" opacity={0.6} />}
                                </div>
                            );

                            if (isDone) {
                                return <div key={task.id}>{innerContent}</div>;
                            }

                            if (task.actionType === 'link') {
                                return (
                                    <Link key={task.id} to={task.actionUrl} style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            {innerContent}
                                        </motion.div>
                                    </Link>
                                );
                            } else {
                                return (
                                    <motion.div key={task.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={task.onClick} style={{ cursor: 'pointer' }}>
                                        {innerContent}
                                    </motion.div>
                                );
                            }
                        })
                    )}
                </div>

                {/* Reward Banner */}
                {allCompleted ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ 
                            padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '0.75rem', 
                            border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            color: '#22c55e', fontWeight: 800
                        }}
                    >
                        <Trophy size={20} />
                        Mission Complete! (+{rewardValue} {themeConfig.reward.label})
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mission Reward</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                            <Star size={16} /> +{rewardValue} {themeConfig.reward.label}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DailyMissionCard;
