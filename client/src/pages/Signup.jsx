import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

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
            console.error('Google signup error:', err);
        }
    };

    const handleGoogleError = () => {
        alert('Google sign-in failed. Please try again.');
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
                        text="signup_with"
                        shape="rectangular"
                        width="300"
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
