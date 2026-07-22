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
        label: 'Gameified',
        icon: <Sparkles size={28} />,
        desc: 'Level up your skills with streaks and challenges.',
        gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
        reward: '🔥 Streaks'
    },
    {
        id: 'movie',
        label: 'Movie',
        icon: <Film size={28} />,
        desc: 'Cinematic learning experience. Collect Tokens.',
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
            navigate('/dashboard');
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
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
                        style={{ width: '100%', maxWidth: '540px' }}
                    >
                        <button
                            onClick={() => setStep(1)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '0.5rem', fontSize: '0.9rem' }}
                        >
                            ← Back
                        </button>
                        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Choose Your Style</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Step 2 of 2 — Pick your learning experience
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {THEMES.map((theme) => (
                                <motion.div
                                    key={theme.id}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setFormData({ ...formData, interest: theme.id })}
                                    style={{
                                        cursor: 'pointer',
                                        borderRadius: '1rem',
                                        padding: '1.25rem 1rem',
                                        textAlign: 'center',
                                        border: formData.interest === theme.id
                                            ? '2px solid white'
                                            : '2px solid rgba(255,255,255,0.08)',
                                        background: formData.interest === theme.id
                                            ? theme.gradient
                                            : 'rgba(255,255,255,0.03)',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {formData.interest === theme.id && (
                                        <div style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: 'white', borderRadius: '50%', padding: '2px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Check size={12} color="#000" />
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '0.5rem' }}>{theme.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{theme.label}</div>
                                    <div style={{ fontSize: '0.72rem', color: formData.interest === theme.id ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                                        {theme.desc}
                                    </div>
                                    <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>
                                        {theme.reward}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                🚀 Create My Account
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Signup;
