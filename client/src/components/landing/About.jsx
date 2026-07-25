import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section id="about" className="landing-section" style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div className="landing-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
                    <h2 className="landing-subheading" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>
                        Education <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Engineered</span> for You
                    </h2>
                    <p className="landing-text" style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.8, margin: 0 }}>
                        We believe education shouldn't be one-size-fits-all. Our mission is to democratize high-quality, personalized education using advanced AI to adapt exactly to how you learn best, creating a journey that is entirely yours.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
