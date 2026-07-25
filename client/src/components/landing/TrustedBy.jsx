import React from 'react';

const TrustedBy = () => {
    return (
        <section id="academic-targets" className="landing-section" style={{ background: '#f8fafc', padding: '4rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
            <div className="landing-container" style={{ textAlign: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem', margin: 0 }}>
                    Supporting Your Academic Journey
                </p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', margin: '0 0 2rem 0' }}>
                    Aligned with major board and competitive entrance exam syllabi
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '3.5rem', opacity: 0.8, marginTop: '1.5rem' }}>
                    {['JEE Advanced Core', 'NEET UG Biology & Sciences', 'CBSE Class 12 Boards', 'National Science Olympiads'].map((stream, idx) => (
                        <div key={idx} style={{ 
                            fontSize: '1.15rem', 
                            fontWeight: 700, 
                            color: '#475569', 
                            background: '#ffffff', 
                            padding: '0.75rem 1.5rem', 
                            borderRadius: '99px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                            cursor: 'default',
                            transition: 'transform 0.2s',
                        }}>
                            {stream}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
