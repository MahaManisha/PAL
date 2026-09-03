import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

const Contact = () => {
    const [email, setEmail] = useState('');
    const [subStatus, setSubStatus] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;
        setSubStatus('demo_success');
        setEmail('');
        setTimeout(() => {
            setSubStatus('');
        }, 5000);
    };

    return (
        <section id="contact" className="landing-section" style={{ padding: '6rem 0' }}>
            <div className="landing-container">
                <div className="glass-panel" style={{ background: '#0f172a', color: '#ffffff', padding: '4rem', borderRadius: '2rem', display: 'flex', flexWrap: 'wrap', gap: '4rem', justifyContent: 'space-between', boxShadow: '0 20px 50px rgba(15,23,42,0.3)' }}>
                    
                    <div style={{ flex: '1 1 400px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff', margin: '0 0 1rem 0' }}>Ready to elevate your learning?</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>Join thousands of students optimizing their study routines with our AI-powered ecosystem.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#cbd5e1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Mail size={20} color="#3b82f6" /> dazdeeptech@gmail.com</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Phone size={20} color="#3b82f6" /> 9486742400</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><MapPin size={20} color="#3b82f6" /> kovilpatti - National Engineering college</div>
                        </div>
                    </div>

                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff', margin: '0 0 1rem 0' }}>Subscribe to our Newsletter</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>Get the latest updates on new chapters, features, and study tips.</p>
                        
                        <form style={{ display: 'flex', gap: '0.5rem', position: 'relative' }} onSubmit={handleSubscribe}>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                aria-label="Email address for newsletter"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: '#ffffff', outline: 'none', marginBottom: 0 }} 
                                required
                                disabled={subStatus === 'demo_success'}
                            />
                            <button 
                                className="btn-premium" 
                                type="submit"
                                style={{ background: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                disabled={subStatus === 'demo_success'}
                            >
                                {subStatus === 'demo_success' ? <Check size={18} /> : <Send size={18} />}
                                <span>{subStatus === 'demo_success' ? 'Subscribed' : 'Subscribe'}</span>
                            </button>
                        </form>
                        
                        {subStatus === 'demo_success' && (
                            <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.75rem', fontWeight: 600 }}>
                                Demo Mode: Email received locally! (No external API connected)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
