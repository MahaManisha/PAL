import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, BarChart3, Shield } from 'lucide-react';

const Features = () => {
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    const featuresData = [
        { title: 'AI Recommendations', desc: 'Dynamic topic suggestions based on your unique assessment performance and learning speed.', icon: <Brain size={28}/>, color: '#3b82f6' },
        { title: 'Smart Practice', desc: 'Target your weak areas automatically with curated practice sets generated in real-time.', icon: <Target size={28}/>, color: '#8b5cf6' },
        { title: 'Performance Analytics', desc: 'Deep insights into your accuracy, study hours, and chapter mastery via intuitive dashboards.', icon: <BarChart3 size={28}/>, color: '#06b6d4' },
        { title: 'Adaptive Progression', desc: 'Unlock new chapters only when you demonstrate true understanding, ensuring solid foundations.', icon: <Shield size={28}/>, color: '#10b981' }
    ];

    return (
        <section id="features" className="landing-section" style={{ background: '#f8fafc', padding: '6rem 0' }}>
            <div className="landing-container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="landing-subheading" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Intelligent Features</h2>
                    <p className="landing-text" style={{ fontSize: '1.1rem', color: '#475569' }}>Everything you need to excel in your studies, built right in.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {featuresData.map((feature, i) => (
                        <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass-panel hover-lift" style={{ padding: '2.5rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ color: feature.color, marginBottom: '1.5rem', padding: '1rem', background: `${feature.color}15`, display: 'inline-flex', borderRadius: '1rem' }}>
                                {feature.icon}
                            </div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a', margin: '0 0 1rem 0' }}>{feature.title}</h4>
                            <p className="landing-text" style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
