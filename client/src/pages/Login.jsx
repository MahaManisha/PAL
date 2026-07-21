import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.msg || 'Login failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Decode the JWT credential to get user info
            const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
            const googleData = {
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub,
                avatar: decoded.picture
            };

            const res = await axios.post('http://localhost:5000/api/auth/google/token', googleData);
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            alert('Google sign-in failed. Please try again.');
            console.error('Google login error:', err);
        }
    };

    const handleGoogleError = () => {
        alert('Google sign-in failed. Please try again.');
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <label>Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #ddd)' }}></div>
                    <span style={{ padding: '0 1rem', color: 'var(--text-muted, #888)', fontSize: '0.9rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #ddd)' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        width="300"
                    />
                </div>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
