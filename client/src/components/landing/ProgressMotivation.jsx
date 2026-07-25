import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy, Award } from 'lucide-react';

const ProgressMotivation = () => {
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section id="motivation" className="landing-section" style={{ padding: '6rem 0' }}>
            <div className="landing-container">
                <div className="landing-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    
                    {/* Left - Mock UI Panel representing progress */}
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeUp} 
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', borderRadius: '1.5rem', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899', padding: '0.5rem', borderRadius: '0.75rem' }}>
                                        <Flame size={24} fill="#ec4899" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Daily Streak</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Keep the flame alive!</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ec4899' }}>5 Days</span>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                    <span>Weekly Goal Progress</span>
                                    <span>85% Completed</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        whileInView={{ width: '85%' }} 
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '99px' }} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                    <Trophy size={20} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                                    <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>Level 12</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rank</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                    <Award size={20} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                                    <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>1,240 XP</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Earned</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - Text & Descriptions */}
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeUp}
                    >
                        <h2 className="landing-subheading" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                            Stay Motivated, <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Track Progress</span>
                        </h2>
                        <p className="landing-text" style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.8, marginBottom: '2rem', margin: '0 0 2rem 0' }}>
                            We break down complex syllabi into micro-goals. With visual progress indicators, streaks, badges, and real-time experience tracking, you stay engaged and focused on incremental success day after day.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { title: 'Micro-Target Learning', desc: 'Convert huge textbook chapters into daily digestible bite-sized checkpoints.' },
                                { title: 'Behavioral Reinforcement', desc: 'Streaks and points motivate positive, daily study habits.' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                        <Star size={18} fill="#8b5cf6" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.25rem 0' }}>{item.title}</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default ProgressMotivation;
