import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, RefreshCcw } from 'lucide-react';

const SlidesPage = () => {
    const { subject, chapter, topic } = useParams();

    // Simulated check for file (actual implementation would try to fetch the PDF)
    const slideUrl = `/slides/${subject}/${chapter}/${topic}.pdf`;

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <Link to="/dashboard" className="btn" style={{ gap: '0.5rem' }}>
                    <ArrowLeft size={18} /> Dashboard
                </Link>
                <h2 className="heading-gradient">Learning Slides</h2>
                <div style={{ width: '100px' }}></div> {/* spacer */}
            </div>

            <div className="glass-card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <FileText size={80} color="var(--primary)" style={{ marginBottom: '2rem', opacity: 0.5 }} />
                <h3>Study Material: {topic}</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '1rem auto' }}>
                    Review the content below to master this topic before attempting the assessment again.
                </p>

                {/* PDF Viewer */}
                <div style={{ width: '100%', maxWidth: '800px', flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0', overflow: 'hidden' }}>
                   <object data={slideUrl} type="application/pdf" width="100%" height="100%">
                        <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>
                            PDF slide not found. Please add the PDF file at <br/>
                            <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '1rem', display: 'inline-block' }}>client/public{slideUrl}</code>
                        </p>
                   </object>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                     <button onClick={() => window.history.back()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                        <RefreshCcw size={18} /> Try Assessment Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SlidesPage;
