import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Download, Globe, Video, BookOpen, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProgression } from '../hooks/useProgression';

const SlidesPage = ({ type = 'TOPIC' }) => {
    const { subject, chapter, topic, chapterId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { themeConfig } = useTheme();

    // Extract topicId safely from location.state or query parameter
    const queryParams = new URLSearchParams(location.search);
    const topicId = location.state?.topicId || queryParams.get('topicId');

    const decodedSubject = decodeURIComponent(subject || '');
    const decodedChapter = decodeURIComponent(chapter || '');
    const decodedTopic   = decodeURIComponent(topic || '');

    const [hasPdf, setHasPdf] = useState(false);
    const [hasPptx, setHasPptx] = useState(false);
    const [hasTamil, setHasTamil] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [language, setLanguage] = useState('en'); // 'en' | 'ta'

    const folderChapter = decodedChapter.includes(':') ? decodedChapter.split(':')[0].trim() : decodedChapter;

    // Gate state
    const [topicDetail, setTopicDetail] = useState(null);
    const [subjectIdStr, setSubjectIdStr] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [isGateResolved, setIsGateResolved] = useState(false);

    const { getTopicState, loading: progressionLoading, progressRecords } = useProgression(subjectIdStr);
    
    const pdfUrl   = `/slides/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}.pdf`;
    const pptxUrl  = `/slides/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}.pptx`;
    const tamilUrl = `/slides/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}_Tamil.pdf`;
    const videoUrl = `/videos/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folderChapter)}/${encodeURIComponent(decodedTopic)}.mp4`;

    const [mainPptUrl, setMainPptUrl] = useState('');
    const [microVideoUrl, setMicroVideoUrl] = useState('');
    const [microPptUrl, setMicroPptUrl] = useState('');

    useEffect(() => {
        const checkAssets = async () => {
            if (type === 'MAIN' && chapterId) {
                try {
                    const res = await fetch(`/api/learning-content/chapter/${chapterId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await res.json();
                    const mainPpt = data.find(c => c.type === 'MAIN_PPT');
                    if (mainPpt && mainPpt.driveLink) {
                        setMainPptUrl(mainPpt.driveLink);
                        setHasPptx(true);
                    }
                } catch (e) {
                    console.error('Failed to load main PPT', e);
                }
                setLoadingAssets(false);
                return;
            }

            // Fetch dynamic micro content
            if (topicId) {
                try {
                    const res = await fetch(`/api/learning-content/topic/${topicId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await res.json();
                    
                    const microVid = data.find(c => c.type === 'MICRO_VIDEO');
                    if (microVid && microVid.driveLink) {
                        setMicroVideoUrl(microVid.driveLink);
                        setHasVideo(true);
                    }
                    
                    const microPpt = data.find(c => c.type === 'MICRO_PPT');
                    if (microPpt && microPpt.driveLink) {
                        setMicroPptUrl(microPpt.driveLink);
                        setHasPptx(true);
                    }
                } catch (e) {
                    console.error('Failed to load dynamic topic content', e);
                }
            }

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
            // Fallbacks for static content
            setHasPptx(prev => prev || pptxExists);
            setHasTamil(tamilExists);
            setHasVideo(prev => prev || videoExists);
            setLoadingAssets(false);
        };

        checkAssets();
    }, [pdfUrl, pptxUrl, tamilUrl, videoUrl, type, chapterId, topicId]);

    // Phase 1: Resolve topic identity
    useEffect(() => {
        if (!topicId) {
            setIsGateResolved(true); // Fallback: allow if no stable ID
            return;
        }

        const verifyAccess = async () => {
            try {
                const res = await apiClient.get(`/api/topics/detail/${topicId}`);
                const detail = res.data;
                setTopicDetail(detail);
                if (detail?.chapterId?.subjectId?._id) {
                    setSubjectIdStr(String(detail.chapterId.subjectId._id));
                } else {
                    setIsGateResolved(true);
                }
            } catch (e) {
                console.error('SlidesPage: Error verifying access', e);
                setIsGateResolved(true);
            }
        };
        verifyAccess();
    }, [topicId]);

    // Phase 2: Evaluate lock
    useEffect(() => {
        if (type === 'MAIN') {
            setIsGateResolved(true);
            return;
        }

        if (!topicDetail || progressionLoading) return;

        const state = getTopicState(topicDetail, topicDetail.chapterId);
        const hasPassed = progressRecords?.find(p => p.topicId === topicId)?.status === 'pass';
        
        if (state === 'LOCKED' && !hasPassed) {
            setIsLocked(true);
        }
        
        setIsGateResolved(true);
    }, [topicDetail, progressionLoading, getTopicState, progressRecords, topicId, type]);

    const activeSlideUrl = language === 'ta' && hasTamil ? tamilUrl : pdfUrl;

    const handleCompleteLearning = async () => {
        if (type === 'MAIN') {
            navigate(`/chapter/${chapterId}/final-assessment`);
            return;
        }

        if (!topicId || !user?.id) {
            // Fallback navigation if no topicId
            navigate('/dashboard');
            return;
        }

        setIsCompleting(true);
        try {
            await apiClient.post('/api/progress/complete-learning', {
                userId: user.id,
                topicId
            });
        } catch (err) {
            console.error('SlidesPage: Error completing learning stage', err);
        } finally {
            setIsCompleting(false);
            navigate(`/topic/${topicId}?tab=practice`);
        }
    };

    if (!isGateResolved || (topicId && progressionLoading)) {
        return (
            <div className="container" style={{ paddingTop: '6rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Verifying access...</div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
                    <Lock size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.6 }} />
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text)' }}>Materials Locked</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        You must complete the required earlier {themeConfig?.terminology?.chapter?.toLowerCase() || 'chapter'}s to unlock this topic's learning materials.
                    </p>
                    <Link to={subjectIdStr ? `/subject/${subjectIdStr}` : '/dashboard'} className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.85rem 2rem', fontWeight: 600 }}>
                        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Return to Roadmap
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '3rem', maxWidth: '1400px', paddingBottom: '4rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Link
                    to={topicId ? `/topic/${topicId}` : '/dashboard'}
                    className="btn btn-secondary"
                    style={{ gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                >
                    <ArrowLeft size={18} /> Back to Topic
                </Link>
                <div style={{ textAlign: 'center' }}>
                    <h2 className="heading-gradient" style={{ fontSize: '2rem' }}>Learning Portal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{decodedChapter} &bull; {decodedTopic}</p>
                </div>
                
                {/* Language Toggle */}
                {hasTamil ? (
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
                ) : <div style={{ width: '150px' }} />}
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
                                type === 'MAIN' && mainPptUrl ? (
                                    <iframe 
                                        src={mainPptUrl} 
                                        width="100%" 
                                        height="100%" 
                                        allow="autoplay" 
                                        style={{ border: 'none' }} 
                                        title="Main Chapter Slides"
                                    ></iframe>
                                ) : type === 'TOPIC' && microPptUrl ? (
                                    <iframe 
                                        src={microPptUrl} 
                                        width="100%" 
                                        height="100%" 
                                        allow="autoplay" 
                                        style={{ border: 'none' }} 
                                        title="Micro Topic Slides"
                                    ></iframe>
                                ) : (
                                    <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '450px' }}>
                                        <FileText size={70} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                                        <h4 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>PowerPoint Presentation</h4>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            This topic slide is formatted as a PowerPoint presentation (PPTX). Download it to study.
                                        </p>
                                        <a href={pptxUrl} download className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                                            <Download size={18} /> Download Presentation (.pptx)
                                        </a>
                                    </div>
                                )
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
                                    {microVideoUrl ? (
                                        <iframe 
                                            src={microVideoUrl} 
                                            width="100%" 
                                            height="100%" 
                                            allow="autoplay" 
                                            style={{ border: 'none' }} 
                                            title="Micro Topic Video"
                                        ></iframe>
                                    ) : (
                                        <video 
                                            src={videoUrl} 
                                            controls 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        >
                                            Your browser does not support HTML5 video playback.
                                        </video>
                                    )}
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Video Notes</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                        Watch the lecture video for <strong>{decodedTopic}</strong> carefully before advancing to practice.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            )}

            {/* Complete Learning & Continue CTA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                <button 
                    onClick={handleCompleteLearning}
                    disabled={isCompleting}
                    className="btn btn-primary" 
                    style={{ 
                        gap: '0.75rem', 
                        padding: '1rem 2.5rem', 
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                        opacity: isCompleting ? 0.7 : 1
                    }}
                >
                    <CheckCircle size={20} />
                    {isCompleting ? 'Saving Progress...' : type === 'MAIN' ? 'Continue to Final Assessment' : 'Complete Learning & Continue to Practice'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default SlidesPage;
