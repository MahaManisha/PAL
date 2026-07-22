import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

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
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <label>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <label>Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
                </form>

                <div style={{ margin: '1.25rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
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
        </div>
    );
};

export default Signup;
