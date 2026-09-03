import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Zap, AlertCircle } from 'lucide-react';

const AdaptivePathResultPage = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await apiClient.get(`/api/progress/chapter/${user.id || user._id}/${chapterId}`);
                setProgress(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        if (user) fetchProgress();
    }, [chapterId, user]);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading results...</div>;

    if (!progress || !progress.currentLevel || progress.currentLevel === 'PENDING') {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <AlertCircle size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
                <h2>No Assessment Results Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please complete the initial assessment first.</p>
                <button className="btn btn-primary" onClick={() => navigate(`/chapter/${chapterId}/initial-assessment`)}>
                    Take Assessment
                </button>
            </div>
        );
    }

    const levelColors = {
        LOW: '#ef4444',
        MEDIUM: '#eab308',
        HIGH: '#22c55e'
    };

    const handleContinue = () => {
        if (progress.pathType === 'DIRECT_MAIN_CONTENT') {
            navigate(`/slides/${chapterId}/main`);
        } else {
            navigate(`/dashboard`);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '3rem 2rem', borderRadius: '1.5rem' }}>
                <Target size={64} style={{ margin: '0 auto 1.5rem', color: levelColors[progress.currentLevel] }} />
                
                <h1 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Assessment Complete!</h1>
                
                <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', display: 'inline-block', minWidth: '300px' }}>
                    <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Your Score</p>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text)' }}>
                        {progress.initialAssessmentScore.toFixed(0)}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>%</span>
                    </div>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Performance Level</p>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 1.5rem', 
                        background: `${levelColors[progress.currentLevel]}22`,
                        border: `1px solid ${levelColors[progress.currentLevel]}`,
                        borderRadius: '999px',
                        color: levelColors[progress.currentLevel],
                        fontWeight: 800,
                        fontSize: '1.25rem'
                    }}>
                        <Zap size={20} />
                        {progress.currentLevel}
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                    {progress.pathType === 'DIRECT_MAIN_CONTENT' 
                        ? "Outstanding! You have a strong grasp of these concepts. We've unlocked the Main Chapter content for you."
                        : "Great effort! Based on your performance, we've created a step-by-step personalized learning path to help you master the topics you missed."}
                </p>

                <motion.button 
                    className="btn btn-primary" 
                    onClick={handleContinue}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
                >
                    Start Your Learning Path <ArrowRight size={20} />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default AdaptivePathResultPage;
