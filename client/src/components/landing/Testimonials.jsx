import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Testimonials = () => {
    const problems = [
        {
            problem: "I keep making the same mistakes on quiz questions.",
            solutionTitle: "Intelligent Mistake Analysis",
            solutionDesc: "Our adaptive engine tags and logs wrong responses, creating targeted diagnostic review sessions to ensure you master the concept before moving on."
        },
        {
            problem: "I don't know what topic to study next.",
            solutionTitle: "Personalized Daily Recommendations",
            solutionDesc: "No more choosing paralysis. The platform analyzes your current strengths and weaknesses to suggest the single most valuable lesson to tackle next."
        },
        {
            problem: "I forget formulas and concepts a week after reading them.",
            solutionTitle: "Spaced Spaced Repetition",
            solutionDesc: "Smart revision triggers automatically flag older chapters at customized mathematical intervals, maximizing your long-term retention."
        },
        {
            problem: "The board and entrance syllabus is completely overwhelming.",
            solutionTitle: "Structured Learning Paths",
            solutionDesc: "We map out the entire curriculum into microscopic milestones, allowing you to study incrementally and build momentum naturally."
        },
        {
            problem: "I lose motivation to study on my own.",
            solutionTitle: "Gamified Progress & Streaks",
            solutionDesc: "Maintain a daily streak, earn Experience Points (XP), level up, and unlock rewards to stay consistent in your academic goals."
        }
    ];

    return (
        <section id="testimonials" className="landing-section" style={{ padding: '6rem 0', background: '#ffffff' }}>
            <div className="landing-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="landing-subheading" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', margin: 0 }}>
                        Built for the Problems Students Actually Face
                    </h2>
                    <p className="landing-text" style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
                        We address the core learning roadblocks with smart software designed to help you excel.
                    </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {problems.map((item, idx) => (
                        <div key={idx} className="glass-panel" style={{ 
                            padding: '2.25rem', 
                            background: '#f8fafc', 
                            borderRadius: '1.5rem', 
                            border: '1px solid #e2e8f0', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}>
                            {/* Problem Card Header */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                    <AlertCircle size={16} />
                                    <span>The Obstacle</span>
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                                    "{item.problem}"
                                </h4>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '1rem 0' }}></div>

                            {/* Solution Block */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                    <CheckCircle2 size={16} />
                                    <span>The Solution</span>
                                </div>
                                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                                    {item.solutionTitle}
                                </h4>
                                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                    {item.solutionDesc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
