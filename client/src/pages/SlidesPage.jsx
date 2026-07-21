import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, RefreshCcw, Download, Globe, Video, Play, BookOpen } from 'lucide-react';

const SlidesPage = () => {
    const { subject, chapter, topic } = useParams();

    const decodedSubject = decodeURIComponent(subject);
    const decodedChapter = decodeURIComponent(chapter);
    const decodedTopic = decodeURIComponent(topic);

    const [hasPdf, setHasPdf] = useState(false);
    const [hasPptx, setHasPptx] = useState(false);
    const [hasTamil, setHasTamil] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [language, setLanguage] = useState('en'); // 'en' | 'ta'

    const folderChapter = decodedChapter.includes(':') ? decodedChapter.split(':')[0].trim() : decodedChapter;
    
    const pdfUrl = `/slides/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}.pdf`;
    const pptxUrl = `/slides/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}.pptx`;
    const tamilUrl = `/slides/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}_Tamil.pdf`;
    const videoUrl = `/videos/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}.mp4`;

    useEffect(() => {
        const checkAssets = async () => {
            const checkExists = async (url) => {
                try {
                    const res = await fetch(url, { method: 'HEAD' });
                    return res.status === 200;
                } catch (e) {
                    return false;
                }
            };

            const [pdfExists, pptxExists, tamilExists, videoExists] = await Promise.all([
                checkExists(pdfUrl),
                checkExists(pptxUrl),
                checkExists(tamilUrl),
                checkExists(videoUrl)
            ]);

            setHasPdf(pdfExists);
            setHasPptx(pptxExists);
            setHasTamil(tamilExists);
            setHasVideo(videoExists);
            setLoadingAssets(false);
        };

        checkAssets();
    }, [pdfUrl, pptxUrl, tamilUrl, videoUrl]);

    const activeSlideUrl = language === 'ta' && hasTamil ? tamilUrl : pdfUrl;

    return (
        <div className="container" style={{ paddingTop: '3rem', maxWidth: '1400px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/dashboard" className="btn btn-secondary" style={{ gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                <div style={{ textAlign: 'center' }}>
                    <h2 className="heading-gradient" style={{ fontSize: '2rem' }}>Learning Portal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{decodedChapter} &bull; {decodedTopic}</p>
                </div>
                
                {/* Language Toggle */}
                {hasTamil && (
                    <button 
                        onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} 
                        className="btn" 
                        style={{ 
                            gap: '0.5rem', 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            border: '1px solid var(--primary)', 
                            color: 'var(--text)' 
                        }}
                    >
                        <Globe size={18} color="var(--primary)" />
                        {language === 'en' ? 'Switch to Tamil Slides' : 'Switch to English Slides'}
                    </button>
                )}
                {!hasTamil && <div style={{ width: '150px' }}></div>}
            </div>

            {loadingAssets ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Loading course materials...</div>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: hasVideo ? '7fr 5fr' : '1fr', 
                    gap: '2rem',
                    alignItems: 'stretch'
                }}>
                    
                    {/* Left Column: Slides View */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        className="glass-card" 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '75vh',
                            padding: '1.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                            <BookOpen size={22} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                Interactive Slides {language === 'ta' && ' (Tamil)'}
                            </h3>
                        </div>

                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {hasPdf ? (
                                <object data={activeSlideUrl} type="application/pdf" width="100%" height="100%">
                                    <embed src={activeSlideUrl} type="application/pdf" width="100%" height="100%" />
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                            PDF presentation cannot be displayed directly in the browser.
                                        </p>
                                        <a href={activeSlideUrl} download className="btn btn-primary">
                                            <Download size={18} /> Download Slide PDF
                                        </a>
                                    </div>
                                </object>
                            ) : hasPptx ? (
                                <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '450px' }}>
                                    <FileText size={70} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                                    <h4 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>PowerPoint Presentation</h4>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        This topic slide is formatted as a PowerPoint presentation (PPTX), which cannot be embedded natively. Download it to study.
                                    </p>
                                    <a href={pptxUrl} download className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                                        <Download size={18} /> Download Presentation (.pptx)
                                    </a>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <FileText size={60} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No slide files are currently configured for this topic.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Video Lecture View */}
                    {hasVideo && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="glass-card" 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                height: '75vh',
                                padding: '1.5rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                                <Video size={22} color="var(--secondary)" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Lecture Video</h3>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                                <div style={{ flex: 1, background: 'black', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
                                    <video 
                                        src={videoUrl} 
                                        controls 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        poster="/video-poster.jpg" // fallback poster
                                    >
                                        Your browser does not support HTML5 video playback.
                                    </video>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Video Notes</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                        Watch the detailed lecture video corresponding to <strong>{decodedTopic}</strong>. Pay close attention to formulas and problem-solving techniques before attempting the assessment again.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            )}

            {/* Try Assessment Again Area */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem', marginBottom: '3rem' }}>
                <button 
                    onClick={() => window.history.back()} 
                    className="btn btn-primary" 
                    style={{ 
                        gap: '0.75rem', 
                        padding: '1rem 2.5rem', 
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)' 
                    }}
                >
                    <RefreshCcw size={20} /> Try Assessment Again
                </button>
            </div>
        </div>
    );
};

export default SlidesPage;
