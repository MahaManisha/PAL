import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
    TrendingUp, Award, Zap, Book, Target, 
    Sparkles, AlertTriangle, ArrowRight, Activity 
} from 'lucide-react';
import { getEffectiveBestScore } from '../utils/progressionEngine';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ProgressAnalytics = () => {
    const { user } = useContext(AuthContext);
    const { themeConfig } = useTheme();
    
    const [progress, setProgress] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [progRes, subRes] = await Promise.all([
                    apiClient.get(`/api/progress/${user.id}`),
                    apiClient.get('/api/subjects')
                ]);
                setProgress(progRes.data || []);
                setSubjects(subRes.data || []);
            } catch (err) {
                console.error("Failed to load analytics data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    // Ensure we only process records that have a valid topic reference
    const topicRecords = progress.filter(p => p.topicId);

    // ─── 1. Top Level Stats ───
    const passedTopics = topicRecords.filter(p => p.status === 'pass');
    const totalPassed = passedTopics.length;
    
    let totalScore = 0;
    let scoredTopicsCount = 0;
    topicRecords.forEach(p => {
        const score = getEffectiveBestScore(p);
        if (score !== null) {
            totalScore += score;
            scoredTopicsCount++;
        }
    });
    const overallMastery = scoredTopicsCount > 0 ? Math.round(totalScore / scoredTopicsCount) : 0;
    
    // Estimate total topics from chapters in subjects (or just show topics passed vs in-progress vs failed)
    const inProgressCount = topicRecords.filter(p => p.status === 'in_progress').length;
    const failedCount = topicRecords.filter(p => p.status === 'fail').length;

    // ─── 2. Strengths & Weaknesses ───
    // Only consider topics with a valid score
    const scoredRecords = topicRecords.filter(p => getEffectiveBestScore(p) !== null).map(p => ({
        ...p,
        effectiveScore: getEffectiveBestScore(p)
    }));
    
    const sortedByScore = [...scoredRecords].sort((a, b) => b.effectiveScore - a.effectiveScore);
    const strongestTopics = sortedByScore.slice(0, 3);
    const weakestTopics = [...scoredRecords].sort((a, b) => a.effectiveScore - b.effectiveScore).slice(0, 3);

    // ─── 3. AI Learning Insight ───
    let insightText = "";
    let insightRecommendation = "";
    if (topicRecords.length === 0) {
        insightText = "You haven't started any topics yet.";
        insightRecommendation = "Start your learning journey by picking a subject from the Dashboard!";
    } else {
        if (strongestTopics.length > 0) {
            insightText += `You're strongest in ${strongestTopics[0].topicId.topicName || strongestTopics[0].topicId.title}`;
            if (weakestTopics.length > 0 && weakestTopics[0]._id !== strongestTopics[0]._id) {
                insightText += `, while ${weakestTopics[0].topicId.topicName || weakestTopics[0].topicId.title} needs more practice. `;
                insightRecommendation = `Recommended: Revise ${weakestTopics[0].topicId.topicName || weakestTopics[0].topicId.title} before moving to the next chapter.`;
            } else {
                insightText += ". Great job!";
                insightRecommendation = "Keep up the excellent momentum and explore new topics.";
            }
        }
        // Simple momentum check based on streak
        if ((user?.streak || 0) > 3) {
            insightText += " Your consistent learning streak is paying off.";
        }
    }

    // ─── 4. Chart Data Preparation ───
    
    // Progress Over Time (Last 10 attempts flattened from all progress records)
    const allAttempts = [];
    topicRecords.forEach(record => {
        if (record.attempts && record.attempts.length > 0) {
            record.attempts.forEach(attempt => {
                allAttempts.push({
                    topicName: record.topicId.topicName || 'Topic',
                    score: attempt.score,
                    timestamp: new Date(attempt.timestamp).getTime(),
                    dateLabel: new Date(attempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                });
            });
        }
    });
    // Sort by time ascending
    allAttempts.sort((a, b) => a.timestamp - b.timestamp);
    const recentAttempts = allAttempts.slice(-15); // Show up to 15 recent attempts

    // Overall Progress Pie
    const pieData = [
        { name: 'Mastered', value: totalPassed, color: '#10b981' },
        { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
        { name: 'Needs Revision', value: failedCount, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // Subject-wise Progress (Bar Chart)
    const subjectStats = {};
    subjects.forEach(sub => {
        subjectStats[sub._id] = { name: sub.name, mastered: 0, totalAttempts: 0 };
    });
    
    // For subject tracking, we need chapter->subject mapping, 
    // but progress only has chapterId. Let's group by chapter if subject mapping isn't direct.
    // If we assume a generic grouping for now:
    const chapterStats = {};
    topicRecords.forEach(record => {
        if (record.chapterId) {
            const chapId = record.chapterId._id || record.chapterId;
            if (!chapterStats[chapId]) {
                chapterStats[chapId] = { 
                    name: record.chapterId.title || record.chapterId.name || `Chapter`, 
                    mastered: 0,
                    avgScore: 0,
                    count: 0
                };
            }
            if (record.status === 'pass') chapterStats[chapId].mastered += 1;
            
            const score = getEffectiveBestScore(record);
            if (score !== null) {
                chapterStats[chapId].avgScore += score;
                chapterStats[chapId].count += 1;
            }
        }
    });

    const barData = Object.values(chapterStats).map(c => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
        'Mastered Topics': c.mastered,
        'Average Score': c.count > 0 ? Math.round(c.avgScore / c.count) : 0
    })).slice(0, 6); // limit to 6 chapters for readability

    // ─── 5. Recent Activity Timeline ───
    // Sort topicRecords by updatedAt descending
    const recentActivity = [...topicRecords].sort((a, b) => {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    }).slice(0, 5);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading Analytics...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(59,130,246,0.1)', borderRadius: '0.5rem', color: '#3b82f6' }}>
                        <TrendingUp size={24} />
                    </div>
                    <h1 className="heading-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>My Progress</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
                    Detailed analytics and insights into your learning journey.
                </p>
            </header>

            {topicRecords.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div style={{ width: '80px', height: '80px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <Target size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text)' }}>Welcome to Analytics</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                        Your progress dashboard will populate with beautiful charts and insights once you start learning and completing topics.
                    </p>
                    <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
                        Go to Dashboard
                    </Link>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '1rem', color: '#10b981' }}>
                                <Award size={24} />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Mastery Level</p>
                                <h3 style={{ fontSize: '1.75rem', color: 'var(--text)' }}>{overallMastery}%</h3>
                            </div>
                        </div>
                        
                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '1rem', color: '#f59e0b' }}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Learning Streak</p>
                                <h3 style={{ fontSize: '1.75rem', color: 'var(--text)' }}>{user?.streak || 0} Days</h3>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '1rem', color: '#3b82f6' }}>
                                <Book size={24} />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Topics Mastered</p>
                                <h3 style={{ fontSize: '1.75rem', color: 'var(--text)' }}>{totalPassed}</h3>
                            </div>
                        </div>
                        
                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: '1rem', color: '#8b5cf6' }}>
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Total {themeConfig.reward.label}</p>
                                <h3 style={{ fontSize: '1.75rem', color: 'var(--text)' }}>{user?.[themeConfig.reward.key] || 0}</h3>
                            </div>
                        </div>
                    </div>

                    {/* AI Learning Insight */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderLeft: '4px solid #3b82f6',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.1)', borderRadius: '50%', color: '#3b82f6', flexShrink: 0 }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.4rem' }}>Your Learning Insight</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                                {insightText}
                            </p>
                            {insightRecommendation && (
                                <p style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                                    {insightRecommendation}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Charts Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                        
                        {/* Progress Over Time */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Recent Assessment Performance</h3>
                            {recentAttempts.length > 1 ? (
                                <div style={{ height: 280, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <LineChart data={recentAttempts} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="dateLabel" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                            <Tooltip 
                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--text)' }}
                                                itemStyle={{ color: '#3b82f6' }}
                                                formatter={(value, name, props) => [`${value}%`, props.payload.topicName]}
                                            />
                                            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
                                    <Activity size={32} style={{ opacity: 0.5 }} />
                                    <span>Complete more assessments to see your trend over time.</span>
                                </div>
                            )}
                        </div>

                        {/* Subject Progress */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Performance by Chapter</h3>
                            {barData.length > 0 ? (
                                <div style={{ height: 280, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--text)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Bar dataKey="Average Score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    Not enough chapter data available yet.
                                </div>
                            )}
                        </div>

                        {/* Topic Distribution */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Overall Status Distribution</h3>
                            <div style={{ height: 280, width: '100%' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--text)' }}
                                            itemStyle={{ color: 'var(--text)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Strengths */}
                            <div className="glass-card" style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Sparkles size={18} color="#10b981" />
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', margin: 0 }}>Strongest Topics</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {strongestTopics.length > 0 ? strongestTopics.map(topic => (
                                        <div key={`strong-${topic._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--card-border)' }}>
                                            <span style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>
                                                {topic.topicId.topicName || topic.topicId.title}
                                            </span>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>{topic.effectiveScore}%</span>
                                        </div>
                                    )) : (
                                        <span style={{ color: 'var(--text-muted)' }}>Complete more topics to see your strengths.</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Weaknesses */}
                            <div className="glass-card" style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <AlertTriangle size={18} color="#ef4444" />
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', margin: 0 }}>Areas for Improvement</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {weakestTopics.length > 0 ? weakestTopics.map(topic => (
                                        <div key={`weak-${topic._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--card-border)' }}>
                                            <span style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>
                                                {topic.topicId.topicName || topic.topicId.title}
                                            </span>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ef4444' }}>{topic.effectiveScore}%</span>
                                        </div>
                                    )) : (
                                        <span style={{ color: 'var(--text-muted)' }}>No major weak areas detected yet!</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Recent Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                <div key={`act-${index}`} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '12px', height: '12px', borderRadius: '50%', 
                                            background: activity.status === 'pass' ? '#10b981' : activity.status === 'fail' ? '#ef4444' : '#3b82f6',
                                            marginTop: '0.35rem'
                                        }} />
                                        {index !== recentActivity.length - 1 && (
                                            <div style={{ width: '2px', height: '40px', background: 'var(--card-border)', marginTop: '0.25rem' }} />
                                        )}
                                    </div>
                                    <div style={{ paddingBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                                {activity.status === 'pass' ? 'Mastered' : activity.status === 'fail' ? 'Needs Revision' : 'Studied'}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(activity.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
                                            {activity.topicId.topicName || activity.topicId.title} 
                                            {activity.status === 'pass' && getEffectiveBestScore(activity) && ` (Score: ${getEffectiveBestScore(activity)}%)`}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No recent activity to show.</div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ProgressAnalytics;
