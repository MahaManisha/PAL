import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            q: "Is the platform strictly for Grade 12 students?",
            a: "While currently optimized for Grade 12 board and entrance exams (JEE/NEET), our adaptive engine adjusts to your baseline, making it highly effective for anyone looking to build a strong foundation in Sciences and Mathematics."
        },
        {
            q: "How does the AI Recommendation system work?",
            a: "Our AI continuously analyzes your quiz performance, speed, and accuracy across micro-topics. It then automatically generates a personalized daily practice set that targets your specific weak areas before they become knowledge gaps."
        },
        {
            q: "Can I switch between the Gamified and Professional themes?",
            a: "Absolutely. Once registered, you can change your learning environment at any time from your dashboard or navbar. Your progress, points, and streaks sync seamlessly across all themes."
        },
        {
            q: "Are the assessments timed?",
            a: "Yes. Our daily challenges and chapter-end assessments are timed to simulate real exam pressure, helping you improve both accuracy and time management."
        }
    ];

    return (
        <section id="faq" className="landing-section" style={{ background: '#f8fafc', padding: '6rem 0' }}>
            <div className="landing-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="landing-subheading" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Frequently Asked Questions</h2>
                </div>
                
                <div className="glass-panel" style={{ background: '#ffffff', padding: '1rem 2.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    {faqs.map((faq, i) => {
                        const isOpen = openFaq === i;
                        return (
                            <div 
                                key={i} 
                                className="faq-item" 
                                onClick={() => setOpenFaq(isOpen ? null : i)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setOpenFaq(isOpen ? null : i);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-expanded={isOpen}
                                style={{ 
                                    borderBottom: i === faqs.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    padding: '1.5rem 0',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <div className="faq-question" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '1.1rem', color: isOpen ? '#2563eb' : '#0f172a', transition: 'color 0.2s' }}>
                                    {faq.q}
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isOpen ? <Minus size={20} color="#2563eb"/> : <Plus size={20} color="#64748b"/>}
                                    </span>
                                </div>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.3 }, opacity: { duration: 0.25, delay: 0.05 } } }} 
                                            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.3 }, opacity: { duration: 0.2 } } }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <p className="faq-answer" style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', marginTop: '1rem', marginBottom: 0 }}>{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
