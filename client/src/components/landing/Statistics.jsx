import React, { useState, useEffect, useRef } from 'react';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

const Statistics = () => {
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);

    const s1 = useAnimatedCounter(50000, 2000, statsVisible);
    const s2 = useAnimatedCounter(1000000, 2500, statsVisible);
    const s3 = useAnimatedCounter(250, 2000, statsVisible);
    const s4 = useAnimatedCounter(95, 1800, statsVisible);

    useEffect(() => {
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setStatsVisible(true);
            }
        }, { threshold: 0.3 });
        
        if (statsRef.current) {
            obs.observe(statsRef.current);
        }
        
        return () => obs.disconnect();
    }, []);

    const statsData = [
        { value: s1, suffix: '+', label: 'Students', color: '#3b82f6' },
        { value: s2, suffix: '+', label: 'Questions Solved', color: '#8b5cf6' },
        { value: s3, suffix: '+', label: 'Learning Modules', color: '#10b981' },
        { value: s4, suffix: '%', label: 'Success Rate', color: '#f59e0b' },
    ];

    return (
        <section id="stats" ref={statsRef} style={{ padding: '6rem 0', background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
            <div className="landing-container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
                    {statsData.map((stat, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '2rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: stat.color, letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>
                                {stat.value >= 1000000 ? `${(stat.value/1000000).toFixed(1)}M` : stat.value >= 1000 ? `${Math.floor(stat.value/1000)}k` : stat.value}{stat.suffix}
                            </h3>
                            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1rem', margin: 0 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Statistics;
