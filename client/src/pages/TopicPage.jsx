import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, Lightbulb, Image as ImageIcon, Video, CheckSquare, Target } from 'lucide-react';

const steps = [
    { id: 'objectives', icon: <Target />, title: 'Learning Objectives' },
    { id: 'concept', icon: <BookOpen />, title: 'Concept Explanation' },
    { id: 'examples', icon: <Lightbulb />, title: 'Examples' },
    { id: 'visuals', icon: <ImageIcon />, title: 'Visual Illustrations' },
    { id: 'videos', icon: <Video />, title: 'Recommended Videos' },
    { id: 'practice', icon: <CheckSquare />, title: 'Practice & Mini Quiz' },
    { id: 'assessment', icon: <Play />, title: 'Final Assessment' }
];

const TopicPage = () => {
    const { id } = useParams();
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    const nextStep = () => {
        if (activeStepIndex < steps.length - 1) {
            setActiveStepIndex(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (activeStepIndex > 0) {
            setActiveStepIndex(prev => prev - 1);
        }
    };

    const renderContent = () => {
        switch (steps[activeStepIndex].id) {
            case 'objectives':
                return (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>What you will learn:</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                            {/* Objectives will be loaded here */}
                        </ul>
                    </div>
                );
            case 'concept':
                return (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Core Concepts</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                            {/* Concept text will be loaded here */}
                        </p>
                    </div>
                );
            case 'examples':
                return (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Solved Examples</h3>
                        <div style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {/* Examples will be loaded here */}
                        </div>
                    </div>
                );
            case 'visuals':
                return (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Visual Illustrations</h3>
                        <div style={{ height: '200px', background: 'var(--card-border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            [Interactive Diagram Placeholder]
                        </div>
                    </div>
                );
            case 'videos':
                return (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recommended Video</h3>
                        <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={48} color="rgba(255,255,255,0.5)" />
                        </div>
                    </div>
                );
            case 'practice':
                return (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Mini Quiz</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Test your understanding before the final assessment.</p>
                        <div style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: '0.5rem' }}>
                            {/* Quiz questions will be loaded here */}
                        </div>
                    </div>
                );
            case 'assessment':
                return (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <Target size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Assessment Ready</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Prove your mastery of this topic. Score at least 70% to unlock the next chapter.
                        </p>
                        <Link to={`/assessment/${id}`} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Start Final Assessment <Play size={18} fill="currentColor" />
                        </Link>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container" style={{ paddingTop: '6rem' }}>
            <Link to="/dashboard" className="btn" style={{ marginBottom: '2rem', paddingLeft: 0, background: 'none' }}>← Back to Subject</Link>
            
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Sidebar Navigation */}
                <div className="glass-card" style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Learning Pipeline</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {steps.map((step, index) => {
                            const isActive = index === activeStepIndex;
                            const isPassed = index < activeStepIndex;
                            
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStepIndex(index)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem', borderRadius: '0.5rem',
                                        background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        color: isActive ? 'var(--primary)' : (isPassed ? 'var(--text)' : 'var(--text-muted)'),
                                        fontWeight: isActive ? 600 : 400,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {step.icon}
                                    <span style={{ fontSize: '0.9rem' }}>{step.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="glass-card" style={{ padding: '2.5rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStepIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ flexGrow: 1 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
                        <button 
                            className="btn" 
                            onClick={prevStep} 
                            disabled={activeStepIndex === 0}
                            style={{ opacity: activeStepIndex === 0 ? 0 : 1, background: 'var(--surface)', border: '1px solid var(--card-border)' }}
                        >
                            Previous Step
                        </button>
                        
                        {activeStepIndex < steps.length - 1 && (
                            <button className="btn btn-primary" onClick={nextStep}>
                                Next Step →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicPage;
