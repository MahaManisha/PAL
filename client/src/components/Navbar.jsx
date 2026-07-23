import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, updateUserInterest } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    
    // Only show the landing page hash links if we are actually on the landing page
    const isLandingPage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        if (isLandingPage) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const landingLinks = [
        { name: 'Home', id: 'home' },
        { name: 'About', id: 'about' },
        { name: 'Features', id: 'features' },
        { name: 'Subjects', id: 'subjects' },
        { name: 'Modes', id: 'modes' },
        { name: 'FAQ', id: 'faq' },
    ];

    return (
        <header className={`navbar-fixed ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen color="var(--primary)" size={28} />
                    <h1 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
                        DAZ<span style={{ color: 'var(--primary)' }}>Learning</span>
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {isLandingPage && !user && landingLinks.map(link => (
                        <button key={link.id} onClick={() => scrollToSection(link.id)} className="nav-link">
                            {link.name}
                        </button>
                    ))}
                    
                    {user ? (
                        <>
                            <select
                                value={user.interest || 'professional'}
                                onChange={(e) => updateUserInterest(e.target.value)}
                                style={{
                                    padding: '0.4rem 0.75rem', background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)', borderRadius: '0.5rem',
                                    color: 'var(--text)', cursor: 'pointer', outline: 'none', fontSize: '0.85rem'
                                }}
                            >
                                <option value="professional">⚡ Professional</option>
                                <option value="gameified">🎮 Gamified</option>
                                <option value="movie">🎬 Cinematic</option>
                            </select>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <button onClick={logout} className="nav-link">Logout</button>
                            <div className="user-avatar" style={{
                                width: '35px', height: '35px', borderRadius: '50%', 
                                background: 'var(--primary)', color: 'white', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
                            <Link to="/login" className="btn" style={{ color: 'var(--text)', background: 'transparent' }}>Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mobile-nav"
                    >
                        {isLandingPage && !user && landingLinks.map(link => (
                            <button key={link.id} onClick={() => scrollToSection(link.id)} className="mobile-nav-link">
                                {link.name}
                            </button>
                        ))}
                        {user ? (
                            <>
                                <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-nav-link">Logout</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                <Link to="/login" className="btn" style={{ textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                <Link to="/signup" className="btn btn-primary" style={{ textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
