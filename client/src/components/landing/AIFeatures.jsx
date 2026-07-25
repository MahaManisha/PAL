import React from 'react';
import { motion } from 'framer-motion';
import { Search, Activity } from 'lucide-react';

const AIFeatures = () => {
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section id="ai" className="landing-section" style={{ padding: '6rem 0' }}>
            <div className="landing-container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                    
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <h2 className="landing-subheading" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                            Driven by <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Data</span>
                        </h2>
                        <p className="landing-text" style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.8, marginBottom: '2rem', margin: '0 0 2rem 0' }}>
                            The platform doesn't just grade you—it understands you. Our recommendation engine parses your quiz metrics instantly to provide actionable insights.
                        </p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 0, margin: 0 }}>
                            <li style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.75rem', borderRadius: '0.75rem', height: 'max-content' }}><Search size={24}/></div>
                                <div>
                                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Diagnostic Assessments</h4>
                                    <p className="landing-text" style={{ fontSize: '0.95rem', color: '#475569', margin: 0 }}>Identify precise knowledge gaps before you begin.</p>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '0.75rem', borderRadius: '0.75rem', height: 'max-content' }}><Activity size={24}/></div>
                                <div>
                                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Real-time Re-routing</h4>
                                    <p className="landing-text" style={{ fontSize: '0.95rem', color: '#475569', margin: 0 }}>Failing a topic? We automatically unlock prerequisite remedial materials.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#2563eb', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>10k+</h3>
                            <p style={{ color: '#64748b', fontWeight: 600, margin: 0 }}>Active Students</p>
                        </div>
                        <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'translateY(2rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>3M+</h3>
                            <p style={{ color: '#64748b', fontWeight: 600, margin: 0 }}>Questions Solved</p>
                        </div>
                        <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>45+</h3>
                            <p style={{ color: '#64748b', fontWeight: 600, margin: 0 }}>Curated Chapters</p>
                        </div>
                        <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'translateY(2rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>98%</h3>
                            <p style={{ color: '#64748b', fontWeight: 600, margin: 0 }}>Satisfaction Rate</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AIFeatures;
