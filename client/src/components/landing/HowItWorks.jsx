import React from 'react';
import { Users, BookOpen, Target, Shield } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        { step: '1', title: 'Register', desc: 'Create account & pick a theme.', icon: <Users size={24}/> },
        { step: '2', title: 'Learn', desc: 'Study theory & view examples.', icon: <BookOpen size={24}/> },
        { step: '3', title: 'Assess', desc: 'Take smart quizzes.', icon: <Target size={24}/> },
        { step: '4', title: 'Unlock', desc: 'Progress to next chapter.', icon: <Shield size={24}/> }
    ];

    return (
        <section id="journey" className="landing-section" style={{ background: '#f8fafc', padding: '6rem 0' }}>
            <div className="landing-container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="landing-subheading" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Your Journey to Mastery</h2>
                    <p className="landing-text" style={{ fontSize: '1.1rem', color: '#475569' }}>A proven step-by-step methodology.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', position: 'relative' }}>
                    {steps.map((item, i) => (
                        <div key={i} style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '1rem' }}>
                            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#ffffff', border: '4px solid #f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#2563eb' }}>
                                {item.icon}
                            </div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                            <p className="landing-text" style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
