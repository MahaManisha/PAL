import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

const Hero = () => {
    const [startAnim, setStartAnim] = useState(false);
    const statsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setStartAnim(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const s1 = useAnimatedCounter(50000, 2000, startAnim);
    const s2 = useAnimatedCounter(1000000, 2500, startAnim);
    const s3 = useAnimatedCounter(250, 2000, startAnim);
    const s4 = useAnimatedCounter(95, 1800, startAnim);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <section id="home" className="landing-hero-immersive">
            <div className="hero-background-overlay"></div>
            
            <motion.div 
                className="hero-content-center"
                initial="hidden" 
                animate="visible" 
                variants={staggerContainer}
            >


                {/* Main Heading */}
                <motion.h1 variants={fadeUp} className="landing-heading" style={{ color: 'white' }}>
                    Learn, Master, and Succeed with AI-Powered Education 🚀
                </motion.h1>

                {/* Description */}
                <motion.p variants={fadeUp} className="landing-text">
                    Master Mathematics, Physics, and Chemistry through adaptive learning paths, intelligent assessments, and personalized study plans. Join the largest global student community online and say goodbye to lack of motivation.
                </motion.p>

                {/* CTA Button */}
                <motion.div variants={fadeUp} style={{ marginTop: '1.5rem' }}>
                    <Link to="/signup" className="hero-cta-button">
                        Start Learning Free <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </motion.div>

            {/* Bottom Glass Statistics Panel */}
            <motion.div 
                ref={statsRef}
                className="hero-bottom-glass"
                initial={{ opacity: 0, y: 50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                transition={{ duration: 1, delay: 0.8 }}
            >
                {[
                    { num: s1, label: 'Active Students', suffix: '+' },
                    { num: s2, label: 'Questions Solved', suffix: '+' },
                    { num: s3, label: 'Learning Modules', suffix: '+' },
                    { num: s4, label: 'Success Rate', suffix: '%' }
                ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '2rem', display: 'block' }}>
                            {stat.num >= 1000000 ? `${(stat.num/1000000).toFixed(1)}M` : stat.num >= 1000 ? `${Math.floor(stat.num/1000)}K` : stat.num}{stat.suffix}
                        </span>
                        <p style={{ fontSize: '0.95rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>{stat.label}</p>
                    </div>
                ))}
            </motion.div>
        </section>
    );
};

export default Hero;
