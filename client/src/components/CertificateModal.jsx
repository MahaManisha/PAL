import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Printer, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const CertificateModal = ({ isOpen, onClose, userName = 'Learner', subjectName = 'Linear Algebra & Engineering Mathematics', score = 100 }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const certId = `DAZ-${Math.floor(100000 + Math.random() * 900000)}`;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9500,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                overflowY: 'auto'
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%', maxWidth: '780px', background: '#0f172a',
                        borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.6)', overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {/* Header Action Bar (Hidden on print) */}
                    <div className="no-print" style={{
                        padding: '1rem 1.5rem', background: 'rgba(30,41,59,0.8)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem' }}>
                            <Award size={20} /> Certificate of Mastery Preview
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <button
                                onClick={handlePrint}
                                className="btn btn-primary"
                                style={{
                                    padding: '0.5rem 1.25rem', borderRadius: '99px',
                                    fontSize: '0.88rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                                }}
                            >
                                <Printer size={16} /> Print / Save PDF
                            </button>
                            <button
                                onClick={onClose}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Printable Certificate Template */}
                    <div id="certificate-print-area" style={{
                        padding: '3rem 2.5rem', margin: '1rem',
                        background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)',
                        border: '8px double #d97706', borderRadius: '1rem',
                        textAlign: 'center', position: 'relative', color: '#ffffff'
                    }}>
                        {/* Corner Accents */}
                        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: '1.2rem', opacity: 0.5 }}>🏆</div>
                        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '1.2rem', opacity: 0.5 }}>🏆</div>
                        <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: '1.2rem', opacity: 0.5 }}>✨</div>
                        <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '1.2rem', opacity: 0.5 }}>✨</div>

                        <div style={{ fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 800, marginBottom: '0.75rem' }}>
                            DAZ Learning Platform · Official Certificate
                        </div>

                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                            CERTIFICATE OF MASTERY
                        </h1>

                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                            This is to certify that
                        </p>

                        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#fbbf24', textDecoration: 'underline', textUnderlineOffset: '6px', marginBottom: '1.25rem' }}>
                            {userName}
                        </h2>

                        <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 2rem' }}>
                            has successfully mastered the comprehensive curriculum and GATE practice modules for<br />
                            <strong style={{ color: '#60a5fa', fontSize: '1.15rem' }}>{subjectName}</strong><br />
                            achieving a mastery score of <strong>{score}%</strong>.
                        </p>

                        {/* Certificate Signature & Stamp Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Date Issued</div>
                                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', marginTop: '0.25rem' }}>{dateStr}</div>
                            </div>

                            <div style={{
                                width: 70, height: 70, borderRadius: '50%',
                                background: 'radial-gradient(circle, #f59e0b 0%, #b45309 100%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 15px rgba(245,158,11,0.5)', border: '2px solid #fef3c7'
                            }}>
                                <ShieldCheck size={24} color="#fff" />
                                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>VERIFIED</span>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Verification ID</div>
                                <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.95rem', marginTop: '0.25rem' }}>{certId}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CertificateModal;
