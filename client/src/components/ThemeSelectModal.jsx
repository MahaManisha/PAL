import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronLeft, Sparkles, BookOpen, Film, ArrowRight } from 'lucide-react';
import { EXPERIENCE_CONFIG } from '../config/experiences';

const EXPERIENCE_ICONS = {
    professional: <BookOpen size={28} />,
    gamified: <Sparkles size={28} />,
    cinematic: <Film size={28} />,
};

const EXPERIENCE_GRADIENTS = {
    professional: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    gamified: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    cinematic: 'linear-gradient(135deg, #b45309, #f59e0b)',
};

// Swatch color from the sub-theme's primary palette value
// NOTE: The modal shell is always dark (#0f172a), so card text must always
// use white-based stable colors regardless of the sub-theme's own atmosphere.
function SubThemeCard({ subKey, cfg, selected, onClick }) {
    const primaryColor = cfg.palette['--primary'] || '#6366f1';

    return (
        <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick(subKey)}
            style={{
                cursor: 'pointer',
                borderRadius: cfg.cardShape === 'pill' ? '9999px'
                    : cfg.cardShape === 'rounded-xl' ? '1.25rem'
                        : cfg.cardShape === 'sharp' ? '0.25rem' : '0.75rem',
                padding: '1rem',
                textAlign: 'left',
                border: selected ? `2px solid ${primaryColor}` : '2px solid rgba(255,255,255,0.12)',
                background: selected
                    ? `linear-gradient(135deg, rgba(30,41,59,0.95), ${primaryColor}44)`
                    : 'rgba(255,255,255,0.06)',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: selected ? `0 0 20px ${primaryColor}66, 0 4px 12px rgba(0,0,0,0.5)` : 'none',
                minHeight: '95px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
            }}
        >
            {selected && (
                <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: primaryColor, borderRadius: '50%', padding: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '22px', height: '22px',
                    boxShadow: `0 0 8px ${primaryColor}`
                }}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                </div>
            )}
            {/* Color swatch row — preserves visual identity dots + emoji */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '0.25rem', alignItems: 'center' }}>
                {[cfg.palette['--primary'], cfg.palette['--secondary'], cfg.palette['--accent']].filter(Boolean).map((c, i) => (
                    <div key={i} style={{
                        width: '13px', height: '13px', borderRadius: '50%', background: c,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: `0 0 6px ${c}88`,
                    }} />
                ))}
                <span style={{ marginLeft: '4px', fontSize: '0.85rem' }}>{cfg.emoji}</span>
            </div>
            {/* Title — modal-stable light color */}
            <div style={{
                fontWeight: 800,
                fontSize: '0.9rem',
                color: '#ffffff',
            }}>
                {cfg.label}
            </div>
            {/* Description — modal-stable light color */}
            <div style={{
                fontSize: '0.75rem',
                color: selected ? '#f1f5f9' : 'rgba(226,232,240,0.78)',
                lineHeight: 1.4,
            }}>
                {cfg.description}
            </div>
        </motion.button>
    );
}
/**
 * ThemeSelectModal
 *
 * Props:
 *   isOpen        — whether to render the modal
 *   mode          — 'setup' (first-time) | 'edit' (change experience)
 *   initialExp    — pre-selected experience (used in edit mode)
 *   initialSub    — pre-selected sub-theme (used in edit mode)
 *   onSave(exp, sub) — called when user confirms
 *   onDismiss()   — called when user closes without saving
 *   isSaving      — boolean: show loading state on the Apply button
 */
const ThemeSelectModal = ({ isOpen, mode = 'setup', initialExp = 'professional', initialSub = '', onSave, onDismiss, isSaving = false }) => {
    const [step, setStep] = useState(1); // 1 = pick experience, 2 = pick sub-theme
    const [selectedExp, setSelectedExp] = useState(initialExp);
    const [selectedSub, setSelectedSub] = useState(initialSub || EXPERIENCE_CONFIG[initialExp]?.defaultSubTheme || 'corporate');

    useEffect(() => {
        if (isOpen) {
            setSelectedExp(initialExp || 'professional');
            const expKey = initialExp || 'professional';
            setSelectedSub(initialSub || EXPERIENCE_CONFIG[expKey]?.defaultSubTheme || 'corporate');
            setStep(1);
        }
    }, [isOpen, initialExp, initialSub]);

    const expConfig = EXPERIENCE_CONFIG[selectedExp];

    const handleExpSelect = (expKey) => {
        setSelectedExp(expKey);
        setSelectedSub(EXPERIENCE_CONFIG[expKey].defaultSubTheme);
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSave = () => {
        if (onSave) onSave(selectedExp, selectedSub);
    };

    const isSetup = mode === 'setup';

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9000,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                    overflowY: 'auto',
                }}
            >
                <motion.div
                    key="modal-panel"
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 30 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1.5rem',
                        width: '100%',
                        maxWidth: '780px',
                        padding: '2.5rem',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Close button (edit mode only) */}
                    {!isSetup && (
                        <button
                            onClick={onDismiss}
                            style={{
                                position: 'absolute', top: '1.25rem', right: '1.25rem',
                                background: 'rgba(255,255,255,0.08)', border: 'none',
                                borderRadius: '50%', width: '36px', height: '36px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#94a3b8', transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        >
                            <X size={18} />
                        </button>
                    )}

                    {/* Header */}
                    <div style={{ marginBottom: '2rem', paddingRight: isSetup ? 0 : '2rem' }}>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div key="h1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                    <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                                        {isSetup ? 'Choose Your Learning Experience' : 'Change Your Experience'}
                                    </h2>
                                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                        {isSetup
                                            ? 'Every experience shares the same curriculum — only the presentation changes.'
                                            : 'Your progress, points, and assessments are never affected by switching.'}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div key="h2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
                                    <button
                                        onClick={handleBack}
                                        style={{
                                            background: 'none', border: 'none', color: '#94a3b8',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            fontSize: '0.9rem', marginBottom: '0.75rem', padding: 0,
                                        }}
                                    >
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                                        {expConfig.emoji} {expConfig.label} — Choose Your Style
                                    </h2>
                                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                        Pick the visual atmosphere that matches your mood.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Step 1: Experience Selection */}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                                    {Object.entries(EXPERIENCE_CONFIG).map(([expKey, cfg]) => (
                                        <motion.button
                                            key={expKey}
                                            whileHover={{ scale: 1.03, y: -3 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleExpSelect(expKey)}
                                            style={{
                                                cursor: 'pointer',
                                                borderRadius: '1.25rem',
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                                border: selectedExp === expKey
                                                    ? '2px solid white'
                                                    : '2px solid rgba(255,255,255,0.08)',
                                                background: selectedExp === expKey
                                                    ? EXPERIENCE_GRADIENTS[expKey]
                                                    : 'rgba(255,255,255,0.03)',
                                                position: 'relative',
                                                transition: 'all 0.2s ease',
                                                boxShadow: selectedExp === expKey ? '0 10px 30px rgba(0,0,0,0.35)' : 'none',
                                                color: '#fff',
                                            }}
                                        >
                                            {selectedExp === expKey && (
                                                <div style={{
                                                    position: 'absolute', top: '10px', right: '10px',
                                                    background: 'white', borderRadius: '50%', padding: '3px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Check size={14} color="#000" />
                                                </div>
                                            )}
                                            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center', opacity: 0.9 }}>
                                                {EXPERIENCE_ICONS[expKey]}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{cfg.emoji} {cfg.label}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                                                {cfg.description}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9 }}>
                                                Reward: {cfg.reward.emoji} {cfg.reward.label}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={handleNext}
                                        className="btn btn-primary"
                                        style={{
                                            borderRadius: '9999px', padding: '0.85rem 2.5rem',
                                            fontSize: '1rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        }}
                                    >
                                        Next: Choose Style <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Sub-theme Selection */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '0.85rem',
                                    marginBottom: '2rem',
                                    maxHeight: '340px',
                                    overflowY: 'auto',
                                    paddingRight: '4px',
                                }}>
                                    {Object.entries(expConfig.subThemes).map(([subKey, cfg]) => (
                                        <SubThemeCard
                                            key={subKey}
                                            subKey={subKey}
                                            cfg={cfg}
                                            selected={selectedSub === subKey}
                                            onClick={setSelectedSub}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    {!isSetup && (
                                        <button
                                            onClick={onDismiss}
                                            style={{
                                                padding: '0.85rem 1.75rem', borderRadius: '9999px',
                                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn btn-primary"
                                        style={{
                                            borderRadius: '9999px', padding: '0.85rem 2.5rem',
                                            fontSize: '1rem', fontWeight: 700,
                                            opacity: isSaving ? 0.7 : 1,
                                        }}
                                    >
                                        {isSaving ? 'Applying…' : isSetup ? '🚀 Start Learning' : '✓ Apply Experience'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step indicator */}
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: '6px',
                        marginTop: '1.5rem',
                    }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                width: step === s ? '24px' : '8px', height: '8px',
                                borderRadius: '99px',
                                background: step === s ? 'var(--primary, #6366f1)' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease',
                            }} />
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ThemeSelectModal;
