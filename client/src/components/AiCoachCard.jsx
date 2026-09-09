import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, BookOpen, Play, ChevronRight, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAiCoach } from '../hooks/useAiCoach';

const AiCoachCard = ({ onAskTutor }) => {
    const { insight, isLoading, error } = useAiCoach();

    if (isLoading) {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                    <div style={{ width: '120px', height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }} />
                </div>
                <div style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', marginBottom: '1rem' }} />
                <div style={{ width: '140px', height: '38px', background: 'rgba(255,255,255,0.1)', borderRadius: '0.6rem' }} />
            </div>
        );
    }

    if (error || !insight) return null;

    let icon = <Brain size={24} color="#fff" />;
    let gradient = 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))';
    let borderColor = 'rgba(99,102,241,0.3)';

    if (insight.type === 'REMEDIATION') {
        icon = <AlertTriangle size={24} color="#fff" />;
        gradient = 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.1))';
        borderColor = 'rgba(245,158,11,0.3)';
    } else if (insight.type === 'MISSION') {
        icon = <Zap size={24} color="#fff" />;
        gradient = 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,179,8,0.1))';
        borderColor = 'rgba(245,158,11,0.3)';
    } else if (insight.type === 'CONTINUE') {
        icon = <Play size={24} color="#fff" />;
    } else if (insight.type === 'REVIEW') {
        icon = <Target size={24} color="#fff" />;
        gradient = 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.1))';
        borderColor = 'rgba(34,197,94,0.3)';
    } else if (insight.type === 'NEXT_TOPIC') {
        icon = <BookOpen size={24} color="#fff" />;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ 
                padding: '1.5rem 2rem', 
                marginBottom: '2rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                background: gradient,
                border: `1px solid ${borderColor}`,
                borderRadius: '1rem',
                flexWrap: 'wrap',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                    padding: '0.85rem', 
                    background: 'var(--primary)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                    {icon}
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <Brain size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            AI Learning Coach
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                        {insight.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0 0 0', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.5 }}>
                        {insight.message}
                    </p>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => onAskTutor(insight)}
                    className="btn" 
                    style={{ 
                        padding: '0.8rem 1.2rem', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)',
                        color: 'var(--text)',
                        borderRadius: '0.6rem'
                    }}
                >
                    <MessageSquare size={16} /> Ask AI Tutor
                </button>
                <Link to="/focus-session" state={{ insight }} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.6rem' }}>
                        Start Focus Session <ChevronRight size={18} />
                    </button>
                </Link>
            </div>
        </motion.div>
    );
};

export default AiCoachCard;
