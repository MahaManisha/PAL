import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Zap, Award, CheckCircle, PlayCircle, Lock } from 'lucide-react';

const Subjects = () => {
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    const subjectsData = [
        { title: 'Mathematics', chapters: 14, desc: 'Calculus, Algebra, Probability & more.', color: '#2563eb', bg: '#eff6ff', icon: <Compass size={40} /> },
        { title: 'Physics', chapters: 15, desc: 'Mechanics, Electromagnetism, Modern Physics.', color: '#0ea5e9', bg: '#f0f9ff', icon: <Zap size={40} /> },
        { title: 'Chemistry', chapters: 16, desc: 'Organic, Inorganic, and Physical Chemistry.', color: '#8b5cf6', bg: '#f5f3ff', icon: <Award size={40} /> }
    ];

    const mockChapterFlow = [
        { id: '1', name: 'Chemical Kinetics', status: 'Completed', score: '94% Mastery', icon: <CheckCircle size={20} color="#10b981" />, bg: '#ecfdf5', borderColor: '#10b981' },
        { id: '2', name: 'Electrochemistry', status: 'Current', score: 'Study in Progress', icon: <PlayCircle size={20} color="#2563eb" />, bg: '#eff6ff', borderColor: '#2563eb' },
        { id: '3', name: 'Coordination Compounds', status: 'Locked', score: 'Requires >80% on Electrochemistry', icon: <Lock size={20} color="#94a3b8" />, bg: '#f8fafc', borderColor: '#cbd5e1' }
    ];

    return (
        <section id="subjects" className="landing-section" style={{ padding: '6rem 0' }}>
            <div className="landing-container">
                
                {/* 1. Subjects Grid */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="landing-subheading" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Comprehensive Curriculum</h2>
                    <p className="landing-text" style={{ fontSize: '1.1rem', color: '#475569' }}>Deep-dive into core Grade 12 subjects structured for absolute mastery.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '5rem' }}>
                    {subjectsData.map((subj, i) => (
                        <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass-panel hover-lift" style={{ padding: '2.5rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', borderTop: `5px solid ${subj.color}`, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ color: subj.color, padding: '0.75rem', background: subj.bg, borderRadius: '1rem', display: 'flex' }}>{subj.icon}</div>
                                <span style={{ padding: '0.25rem 0.75rem', background: '#f1f5f9', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                                    {subj.chapters} Chapters
                                </span>
                            </div>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{subj.title}</h4>
                            <p className="landing-text" style={{ fontSize: '1rem', color: '#475569', marginBottom: '2rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>{subj.desc}</p>
                            <Link to="/signup" className="btn-premium-outline" style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', padding: '0.8rem', borderRadius: '99px', border: '2px solid #e2e5e9', color: '#0f172a', fontWeight: 600, textDecoration: 'none', textAlign: 'center', transition: 'all 0.3s' }}>
                                Explore Syllabus
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* 2. Sequential Adaptive Unlock Flow Demonstration */}
                <div style={{ background: '#f8fafc', padding: '4rem 3rem', borderRadius: '2rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adaptive Progression System</span>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.75rem' }}>Sequential Chapter Unlocking</h3>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
                            Students unlock new chapters only after reaching a mastery score of 80%+ in preceding assessments. 
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', gap: '2rem', justifyContent: 'center' }} className="chapter-flow-container">
                        {mockChapterFlow.map((chap, idx) => (
                            <div key={idx} style={{ 
                                flex: 1, 
                                background: chap.bg, 
                                border: `2px solid ${chap.borderColor}`, 
                                padding: '1.5rem 2rem', 
                                borderRadius: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.25rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                            }}>
                                <div style={{ display: 'flex', flexShrink: 0 }}>
                                    {chap.icon}
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>CHAPTER 0{chap.id}</span>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>{chap.name}</h4>
                                    <span style={{ fontSize: '0.85rem', color: chap.status === 'Completed' ? '#10b981' : chap.status === 'Current' ? '#2563eb' : '#64748b', fontWeight: 600 }}>
                                        {chap.score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Subjects;
