import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Award, Clock, Play, BookOpen, Compass, Tv, Laptop, BarChart2 } from 'lucide-react';

const LearningExperiences = () => {
    const [previewTheme, setPreviewTheme] = useState('professional');

    const themes = [
        {
            id: 'professional',
            name: 'Professional Mode',
            desc: 'A clean, clutter-free layout optimized for deep focus and structured academic metrics.',
            color: '#2563eb',
            bg: '#ffffff',
            textColor: '#0f172a'
        },
        {
            id: 'gameified',
            name: 'Gamified Mode',
            desc: 'Turn your study plan into an adventure. Earn XP, badges, daily streaks, and levels.',
            color: '#a855f7',
            bg: '#0f172a',
            textColor: '#f8fafc'
        },
        {
            id: 'movie',
            name: 'Cinematic Mode',
            desc: 'Treat your curriculum like a blockbuster series. Learn through episodes and interactive theater.',
            color: '#f59e0b',
            bg: '#111111',
            textColor: '#f5f5f5'
        }
    ];

    const renderMockDashboard = () => {
        switch (previewTheme) {
            case 'professional':
                return (
                    <motion.div 
                        key="prof"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ background: '#ffffff', color: '#0f172a', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #cbd5e1' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>COURSE MODULE</span>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Rotational Dynamics</h4>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>STUDY HOUR LIMIT</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>14.2 Hours</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>MASTERY SCORE</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#16a34a' }}>88%</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { title: '1. Angular Velocity and Acceleration', type: 'Theory', status: 'Completed' },
                                { title: '2. Torque & Moment of Inertia', type: 'Assessment', status: 'In Progress' },
                                { title: '3. Conservation of Angular Momentum', type: 'Exam Prep', status: 'Locked' }
                            ].map((topic, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <BookOpen size={16} color="#475569" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{topic.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700, color: '#475569' }}>{topic.type}</span>
                                        <span style={{ fontSize: '0.8rem', color: topic.status === 'Completed' ? '#16a34a' : topic.status === 'In Progress' ? '#2563eb' : '#94a3b8', fontWeight: 700 }}>
                                            {topic.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'gameified':
                return (
                    <motion.div 
                        key="game"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ background: '#1e293b', color: '#f8fafc', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #334155' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: '#a855f7', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
                                    <Award size={20} color="#ffffff" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Level 8 Explorer</h4>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>840 / 1000 XP to next level</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ec489918', padding: '0.35rem 0.75rem', borderRadius: '99px', border: '1px solid #ec489940' }}>
                                <Flame size={16} fill="#ec4899" color="#ec4899" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ec4899' }}>5 Day Streak</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { title: 'Quest: Complete Torque Challenge', reward: '+150 XP', active: true },
                                { title: 'Daily Practice Set', reward: '+100 XP', active: true },
                                { title: 'Boss Quiz: Angular Momentum', reward: 'Unlock Badge 🏆', active: false }
                            ].map((quest, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #1e293b' }}>
                                    <span style={{ fontSize: '0.9rem', color: quest.active ? '#f8fafc' : '#64748b', fontWeight: 600 }}>{quest.title}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 800 }}>{quest.reward}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'movie':
                return (
                    <motion.div 
                        key="movie"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ background: '#111111', color: '#e5e5e5', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #262626' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Now Playing: Season 1</span>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Episode 4: Universal Gravitation</h4>
                            </div>
                            <button style={{ background: '#f59e0b', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Play size={18} fill="#000" color="#000" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[
                                { ep: 'Ep 1', title: 'Orbits', duration: '14 min', watched: true },
                                { ep: 'Ep 2', title: 'Kepler Laws', duration: '18 min', watched: true },
                                { ep: 'Ep 3', title: 'Tidal Forces', duration: '22 min', watched: false }
                            ].map((episode, i) => (
                                <div key={i} style={{ background: '#171717', border: '1px solid #262626', padding: '0.75rem', borderRadius: '0.5rem', position: 'relative' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>{episode.ep}</span>
                                    <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', margin: '0.2rem 0' }}>{episode.title}</h5>
                                    <span style={{ fontSize: '0.65rem', color: '#737373' }}>{episode.duration}</span>
                                    {episode.watched && (
                                        <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <section id="modes" className="landing-section" style={{ background: '#0f172a', color: '#ffffff', padding: '6rem 0' }}>
            <div className="landing-container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    
                    {/* Left - Theme Switcher text descriptions */}
                    <div>
                        <h2 className="landing-subheading" style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', margin: 0 }}>
                            Immersive Themes
                        </h2>
                        <p className="landing-text" style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                            We customize the structure, indicators, and aesthetics to suit your learning personality. Toggle below to preview:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setPreviewTheme(theme.id)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        background: previewTheme === theme.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        border: 'none',
                                        borderLeft: `4px solid ${previewTheme === theme.id ? theme.color : 'transparent'}`,
                                        padding: '1rem 1.5rem',
                                        borderRadius: '0 0.75rem 0.75rem 0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        outline: 'none'
                                    }}
                                >
                                    <span style={{ display: 'block', fontWeight: 800, fontSize: '1.1rem', color: previewTheme === theme.id ? theme.color : '#ffffff' }}>
                                        {theme.name}
                                    </span>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                        {theme.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right - Live Interactive Theme Preview */}
                    <div>
                        <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '1.5rem', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                            {/* Browser/Window Header Header */}
                            <div style={{ display: 'flex', gap: '0.35rem', padding: '0.5rem 1rem', borderBottom: '1px solid #334155', marginBottom: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '1rem', fontFamily: 'monospace' }}>DAZLearning.app/rotational-dynamics</span>
                            </div>

                            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <AnimatePresence mode="wait">
                                    {renderMockDashboard()}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default LearningExperiences;
