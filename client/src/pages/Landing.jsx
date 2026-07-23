import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    BookOpen, Zap, Award, ChevronRight, Brain, Target, Activity, 
    MonitorPlay, Shield, Users, Clock, CheckCircle2 
} from 'lucide-react';

const Landing = () => {
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="landing-page" style={{ overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section id="home" className="container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '8rem' }}>
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '800px' }}>
                    <motion.div variants={fadeIn} style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '2rem', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 600 }}>
                        <Brain size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                        AI-Powered Learning Platform
                    </motion.div>
                    
                    <motion.h2 variants={fadeIn} className="heading-gradient" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Master Grade 12 with Adaptive Intelligence
                    </motion.h2>
                    
                    <motion.p variants={fadeIn} style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Personalized learning paths, smart assessments, and three immersive environments designed to help you conquer your board and entrance exams.
                    </motion.p>
                    
                    <motion.div variants={fadeIn} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Start Learning Free <ChevronRight size={20} />
                        </Link>
                        <a href="#features" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                            Explore Features
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* About Section */}
            <section id="about" style={{ background: 'var(--surface)', padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
                        <h3 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Vision</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            We believe education shouldn't be one-size-fits-all. Our mission is to democratize high-quality, personalized education using advanced AI to adapt to how you learn best.
                        </p>
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section id="features" className="container" style={{ padding: '6rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h3 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Intelligent Features</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Everything you need to excel in your studies.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[
                        { title: 'AI Recommendations', desc: 'Dynamic topic suggestions based on your assessment performance.', icon: <Brain /> },
                        { title: 'Smart Practice', desc: 'Target your weak areas automatically with curated practice sets.', icon: <Target /> },
                        { title: 'Performance Tracking', desc: 'Real-time analytics on your accuracy, speed, and chapter mastery.', icon: <Activity /> },
                        { title: 'Adaptive Progression', desc: 'Unlock new chapters only when you demonstrate true understanding.', icon: <Shield /> }
                    ].map((feature, i) => (
                        <motion.div key={i} whileHover={{ y: -5 }} className="glass-card" style={{ padding: '2rem' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(37, 99, 235, 0.1)', display: 'inline-block', borderRadius: '1rem' }}>
                                {feature.icon}
                            </div>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feature.title}</h4>
                            <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Subjects Section */}
            <section id="subjects" style={{ background: 'var(--surface)', padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h3 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Core Subjects</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Comprehensive curriculum for Grade 12.</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: 'Mathematics', chapters: 14, diff: 'Hard', color: '#2563eb', icon: <Activity size={32} /> },
                            { title: 'Physics', chapters: 15, diff: 'Medium', color: '#0ea5e9', icon: <Zap size={32} /> },
                            { title: 'Chemistry', chapters: 16, diff: 'Medium', color: '#3b82f6', icon: <Award size={32} /> }
                        ].map((subj, i) => (
                            <div key={i} className="glass-card" style={{ borderTop: `4px solid ${subj.color}`, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ color: subj.color, marginBottom: '1rem' }}>{subj.icon}</div>
                                <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{subj.title}</h4>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={16}/> {subj.chapters} Chapters</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={16}/> {subj.diff}</span>
                                </div>
                                <Link to="/signup" className="btn" style={{ width: '100%', background: 'transparent', border: `1px solid ${subj.color}`, color: subj.color }}>
                                    Explore Syllabus
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Learning Modes Preview */}
            <section id="modes" className="container" style={{ padding: '6rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h3 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Experience</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Three distinct themes. One unified learning journey.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="glass-card" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>Professional</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#475569' }}>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#2563eb"/> Clean UI</li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#2563eb"/> Advanced Analytics</li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#2563eb"/> Academic Focus</li>
                        </ul>
                    </div>
                    <div className="glass-card" style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#a855f7' }}>Gamified</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8' }}>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#a855f7"/> XP & Levels</li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#a855f7"/> Achievement Badges</li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#a855f7"/> Study Streaks</li>
                        </ul>
                    </div>
                    <div className="glass-card" style={{ background: '#111111', color: '#f5f5f5', border: '1px solid #262626' }}>
                        <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f59e0b' }}>Cinematic</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#a3a3a3' }}>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#f59e0b"/> Dark Elegant UI</li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#f59e0b"/> Seasons & Episodes</li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16} color="#f59e0b"/> Story Progression</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* How It Works & FAQ (Simplified for length) */}
            <section id="faq" style={{ background: 'var(--surface)', padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h3 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How It Works</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}><Users size={40} color="var(--primary)" /><p>1. Register</p></div>
                        <ChevronRight color="var(--text-muted)" />
                        <div style={{ textAlign: 'center' }}><MonitorPlay size={40} color="var(--primary)" /><p>2. Learn</p></div>
                        <ChevronRight color="var(--text-muted)" />
                        <div style={{ textAlign: 'center' }}><Target size={40} color="var(--primary)" /><p>3. Assess</p></div>
                        <ChevronRight color="var(--text-muted)" />
                        <div style={{ textAlign: 'center' }}><Shield size={40} color="var(--primary)" /><p>4. Unlock</p></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
