import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Linkedin, Twitter, Mail, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', padding: '4rem 2rem' }}>
                
                {/* Brand Information */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <BookOpen color="var(--primary)" size={24} />
                        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
                            DAZ<span style={{ color: 'var(--primary)' }}>Learning</span>
                        </h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        An AI-powered Intelligent Learning Platform designed to personalize your Grade 12 educational journey.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" className="social-icon"><Twitter size={20} /></a>
                        <a href="#" className="social-icon"><Linkedin size={20} /></a>
                        <a href="#" className="social-icon"><Github size={20} /></a>
                        <a href="#" className="social-icon"><Facebook size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#subjects">Subjects</a></li>
                        <li><a href="#modes">Learning Modes</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Resources</h3>
                    <ul className="footer-links">
                        <li><a href="#">Mathematics</a></li>
                        <li><a href="#">Physics</a></li>
                        <li><a href="#">Chemistry</a></li>
                        <li><a href="#">AI Recommendations</a></li>
                        <li><a href="#">Practice Tests</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Subscribe</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Get the latest updates and study tips directly to your inbox.
                    </p>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Your Email Address" style={{ marginBottom: 0 }} required />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Subscribe</button>
                    </form>
                </div>
            </div>

            {/* Copyright */}
            <div style={{ borderTop: '1px solid var(--card-border)', padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>&copy; {new Date().getFullYear()} DAZLearning. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
