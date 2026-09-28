import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const AchievementUnlockModal = ({ achievements = [], onClose }) => {
    React.useEffect(() => {
        if (achievements.length > 0) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#eab308']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#eab308']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [achievements]);

    if (!achievements || achievements.length === 0) return null;

    // For simplicity, if multiple unlock at once, just show the first one's main details or a summary.
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '2.5rem 2rem',
                        textAlign: 'center',
                        borderRadius: '1.5rem',
                        background: 'linear-gradient(180deg, var(--surface) 0%, var(--background) 100%)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(99,102,241,0.15)',
                        border: '2px solid rgba(99,102,241,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                        position: 'relative'
                    }}>
                        <Award size={40} color="#818cf8" />
                        <Sparkles 
                            size={20} 
                            color="#eab308" 
                            style={{ position: 'absolute', top: '-10px', right: '-10px' }} 
                        />
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
                        Achievement Unlocked!
                    </h2>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        {achievements.map((key, i) => (
                            <div key={i} style={{ 
                                fontWeight: 700, 
                                fontSize: '1.2rem', 
                                color: 'var(--primary)',
                                margin: '0.5rem 0'
                            }}>
                                {key.replace(/_/g, ' ')}
                            </div>
                        ))}
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
                        Incredible work! You've just reached a new milestone in your learning journey.
                    </p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            background: 'rgba(34,197,94,0.1)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            color: '#4ade80',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}>
                            +50 XP
                        </div>
                        <div style={{
                            background: 'rgba(234,179,8,0.1)',
                            border: '1px solid rgba(234,179,8,0.2)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            color: '#fde047',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}>
                            +10 Tokens
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.8rem 2rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                            transition: 'all 0.2s',
                            width: '100%'
                        }}
                    >
                        Awesome!
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AchievementUnlockModal;
