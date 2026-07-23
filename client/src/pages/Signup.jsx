import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Check, BookOpen, Sparkles, Film } from 'lucide-react';

const THEMES = [
    {
        id: 'professional',
        label: 'Professional',
        icon: <BookOpen size={28} />,
        desc: 'Clean, focused learning environment. Earn Points.',
        gradient: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        reward: '⭐ Points'
    },
    {
        id: 'gameified',
        label: 'Gamified',
        icon: <Sparkles size={28} />,
        desc: 'Level up your skills with streaks and challenges.',
        gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
        reward: '🔥 Streaks'
    },
    {
        id: 'movie',
        label: 'Cinematic',
        icon: <Film size={28} />,
        desc: 'Immersive dark UI with story-like progression.',
        gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
        reward: '🎟️ Tokens'
    }
];

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', interest: 'professional' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            alert('Please fill in all fields before moving to the next step');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            login(res.data);
            navigate('/dashboard'); // Go directly to dashboard
        } catch (err) {
            alert(err.response?.data?.msg || 'Signup failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/google', {
                idToken: credentialResponse.credential
            });
            login(res.data);
            // If they login via google, they just go to dashboard.
            navigate('/dashboard');
        } catch (err) {
            console.error('Google Auth Signup error:', err);
            alert(err.response?.data?.msg || err.message || 'Google Signup failed');
        }
    };

    const handleGoogleError = () => {
        alert('Google Sign-In was unsuccessful. Please try again.');
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '4rem' }}>
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="glass-card"
                        style={{ width: '100%', maxWidth: '420px' }}
                    >
                        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Step 1 of 2 — Your details
                        </p>

                        <form onSubmit={handleNextStep}>
                            <label>Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            <label>Password</label>
                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Continue →
                            </button>
                        </form>

                        <div style={{ margin: '1.25rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                                theme="filled_blue"
                                shape="rectangular"
                                width="350"
                            />
                        </div>

                        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="glass-card"
                        style={{ width: '100%', maxWidth: '750px' }}
                    >
                        <button
                            onClick={() => setStep(1)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.95rem', padding: '0.5rem 0' }}
                        >
                            ← Back to details
                        </button>
                        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '2rem' }}>Choose Your Learning Experience</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1rem' }}>
                            You can change this anytime in your dashboard settings.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {THEMES.map((theme) => (
                                <motion.div
                                    key={theme.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData({ ...formData, interest: theme.id })}
                                    style={{
                                        cursor: 'pointer',
                                        borderRadius: '1.25rem',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        border: formData.interest === theme.id
                                            ? '2px solid white'
                                            : '2px solid rgba(255,255,255,0.08)',
                                        background: formData.interest === theme.id
                                            ? theme.gradient
                                            : 'rgba(255,255,255,0.03)',
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        boxShadow: formData.interest === theme.id ? '0 10px 25px rgba(0,0,0,0.2)' : 'none'
                                    }}
                                >
                                    {formData.interest === theme.id && (
                                        <div style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            background: 'white', borderRadius: '50%', padding: '4px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Check size={16} color="#000" />
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{theme.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem' }}>{theme.label}</div>
                                    <div style={{ fontSize: '0.85rem', color: formData.interest === theme.id ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                                        {theme.desc}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.9 }}>
                                        Reward: {theme.reward}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                                🚀 Complete Registration
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Signup;
