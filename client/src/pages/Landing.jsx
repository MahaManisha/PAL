import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Award, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing-page">
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>DAZ<span style={{ color: 'var(--primary)' }}>Learning</span></h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn" style={{ color: 'white' }}>Login</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up Free</Link>
        </div>
      </nav>

      <main className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-gradient" style={{ fontSize: '4rem', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
            Master Grade 12 with Assessment-First Learning
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Prove your knowledge through assessments first. Unlock topics dynamically or learn through curated visual slides.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Get Started Now <ChevronRight size={20} />
            </Link>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '6rem' }}>
          {[
            { title: 'Mathematics', icon: <ChevronRight color="var(--primary)" />, color: 'var(--primary)' },
            { title: 'Physics', icon: <Zap color="var(--secondary)" />, color: 'var(--secondary)' },
            { title: 'Chemistry', icon: <Award color="var(--accent)" />, color: 'var(--accent)' }
          ].map((subj, i) => (
            <motion.div
              key={subj.title}
              whileHover={{ scale: 1.05 }}
              className="glass-card"
              style={{ textAlign: 'left', borderLeft: `4px solid ${subj.color}` }}
            >
              <div style={{ marginBottom: '1rem' }}>{subj.icon}</div>
              <h3>{subj.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Complete curriculum coverage for 12th Grade boards and entrance exams.
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
