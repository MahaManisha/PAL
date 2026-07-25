import React, { useEffect } from 'react';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import Features from '../components/landing/Features';
import Subjects from '../components/landing/Subjects';
import LearningExperiences from '../components/landing/LearningExperiences';
import AIFeatures from '../components/landing/AIFeatures';
import HowItWorks from '../components/landing/HowItWorks';
import ProgressMotivation from '../components/landing/ProgressMotivation';
import Statistics from '../components/landing/Statistics';
import TrustedBy from '../components/landing/TrustedBy';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Contact from '../components/landing/Contact';

const Landing = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ background: '#ffffff', color: '#0f172a', overflowX: 'hidden', position: 'relative' }}>
            {/* Background Blobs */}
            <div className="landing-blob" style={{ background: 'rgba(37, 99, 235, 0.12)', top: '-10%', left: '-10%', width: '60vw', height: '60vw' }}></div>
            <div className="landing-blob" style={{ background: 'rgba(168, 85, 247, 0.08)', top: '20%', right: '-10%', width: '50vw', height: '50vw', animationDelay: '2s' }}></div>
            <div className="landing-blob" style={{ background: 'rgba(6, 182, 212, 0.08)', bottom: '10%', left: '5%', width: '45vw', height: '45vw', animationDelay: '4s' }}></div>

            <Hero />
            <About />
            <Features />
            <Subjects />
            <LearningExperiences />
            <AIFeatures />
            <HowItWorks />
            <ProgressMotivation />
            <Statistics />
            <TrustedBy />
            <Testimonials />
            <FAQ />
            <Contact />
        </div>
    );
};

export default Landing;
