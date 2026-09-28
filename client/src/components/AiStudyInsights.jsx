import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Target, Sparkles, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const AiStudyInsights = ({ user, progress }) => {
    const { themeConfig } = useTheme();
    const { terminology } = themeConfig;

    // Guard against missing data
    const validProgress = Array.isArray(progress) ? progress.filter(p => p && p.topicId && p.topicId.topicName) : [];

    // 1. Strongest Topic
    const passedTopics = validProgress.filter(p => p.status === 'pass');
    let strongest = null;
    if (passedTopics.length > 0) {
        strongest = passedTopics.reduce((max, p) => ((p.bestScore || 0) > (max.bestScore || 0) ? p : max), passedTopics[0]);
    }

    // 2. Improvement Area
    const strugglingTopics = validProgress.filter(p => p.status !== 'pass' && Array.isArray(p.attempts) && p.attempts.length > 0);
    let weakest = null;
    if (strugglingTopics.length > 0) {
        weakest = strugglingTopics.reduce((min, p) => ((p.bestScore || 0) < (min.bestScore || 0) ? p : min), strugglingTopics[0]);
    } else if (passedTopics.length > 1) {
        // Fallback: Lowest passing score if no struggling topics
        weakest = passedTopics.reduce((min, p) => ((p.bestScore || 100) < (min.bestScore || 100) ? p : min), passedTopics[0]);
        // Don't flag as weakest if they got 100% on everything
        if (weakest.bestScore === 100) weakest = null;
    }

    // 3. Momentum
    const streak = user?.streak || 0;
    let momentumText = "";
    let momentumVal = "";
    let momentumSub = "";
    
    if (streak > 0) {
        momentumText = `You're on a`;
        momentumVal = `${streak}-day`;
        momentumSub = `learning streak!`;
    } else {
        const today = new Date().toDateString();
        const activeToday = validProgress.filter(p => p.updatedAt && new Date(p.updatedAt).toDateString() === today).length;
        if (activeToday > 0) {
            momentumText = `You've made progress on`;
            momentumVal = `${activeToday}`;
            momentumSub = `${activeToday === 1 ? terminology.topic : terminology.topic + 's'} today.`;
        } else {
            momentumText = "Start a topic today to";
            momentumVal = "build your streak!";
            momentumSub = "";
        }
    }

    // 4. Current Focus
    let focus = null;
    const inProgressTopics = validProgress.filter(p => p.status === 'in_progress' || p.status === 'fail');
    if (inProgressTopics.length > 0) {
        focus = inProgressTopics.reduce((latest, p) => (new Date(p.updatedAt) > new Date(latest.updatedAt) ? p : latest), inProgressTopics[0]);
    }

    // Empty State (Brand new user)
    if (validProgress.length === 0) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
                    <Sparkles size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)' }}>AI Study Insights</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
                    Your personalized AI insights will appear here once you start learning. Complete your first {terminology.topic} to unlock performance tracking!
                </p>
                <Link to="/roadmap" className="btn btn-primary" style={{ marginTop: '1.5rem', borderRadius: '99px', padding: '0.75rem 2rem' }}>
                    Go to Roadmap
                </Link>
            </motion.div>
        );
    }

    const InsightBlock = ({ icon, color, title, children, link }) => (
        <div style={{ 
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', 
            borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' 
        }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    {title}
                </h4>
                <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.4, fontWeight: 500 }}>
                    {children}
                </div>
                {link && (
                    <Link to={link} style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                        View Topic →
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Brain size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>AI Study Insights</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                
                {/* 1. Strongest Topic */}
                {strongest ? (
                    <InsightBlock icon={<Sparkles size={20} />} color="#8b5cf6" title="Top Strength">
                        You've mastered <strong style={{ color: 'var(--text)' }}>{strongest.topicId.topicName}</strong> with a score of <strong style={{ color: '#8b5cf6' }}>{strongest.bestScore}%</strong>!
                    </InsightBlock>
                ) : (
                    <InsightBlock icon={<Sparkles size={20} />} color="#8b5cf6" title="Top Strength">
                        Pass your first {terminology.topic} to discover your top strength!
                    </InsightBlock>
                )}

                {/* 2. Improvement Area */}
                {weakest ? (
                    <InsightBlock 
                        icon={<AlertTriangle size={20} />} 
                        color={weakest.status === 'fail' ? "#ef4444" : "#f59e0b"} 
                        title="Needs Attention"
                        link={`/topic/${weakest.topicId._id || weakest.topicId}?tab=learn`}
                    >
                        <strong style={{ color: 'var(--text)' }}>{weakest.topicId.topicName}</strong> is proving challenging. Consider a quick review.
                    </InsightBlock>
                ) : (
                    <InsightBlock icon={<BookOpen size={20} />} color="#22c55e" title="Solid Foundation">
                        Great job! You don't have any major weak areas holding you back right now.
                    </InsightBlock>
                )}

                {/* 3. Momentum */}
                <InsightBlock icon={<TrendingUp size={20} />} color="#3b82f6" title="Learning Momentum">
                    {momentumText} <strong style={{ color: '#3b82f6' }}>{momentumVal}</strong> {momentumSub}
                </InsightBlock>

                {/* 4. Current Focus */}
                {focus && (
                    <InsightBlock icon={<Target size={20} />} color="var(--primary)" title="Current Focus" link={`/topic/${focus.topicId._id || focus.topicId}?tab=learn`}>
                        Ready to pick up where you left off in <strong style={{ color: 'var(--text)' }}>{focus.topicId.topicName}</strong>?
                    </InsightBlock>
                )}

            </div>
        </motion.div>
    );
};

export default AiStudyInsights;
