import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { PlayCircle, ExternalLink, Film, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { formatEmbedUrl, isVideoFile } from '../utils/mediaUtils';

const checkVideoExists = async (url) => {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) return false;
        return res.status === 200 || contentType.includes('video/');
    } catch (e) {
        return false;
    }
};

const ChapterTrailerPage = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const [chapterInfo, setChapterInfo] = useState(null);
    const [rawUrl, setRawUrl] = useState('');
    const [videoSrc, setVideoSrc] = useState('');
    const [isVideoNative, setIsVideoNative] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTrailer = async () => {
            setLoading(true);
            try {
                // 1. Fetch chapter metadata
                let chName = '';
                try {
                    const chRes = await apiClient.get(`/api/chapters`);
                    const chapters = Array.isArray(chRes.data) ? chRes.data : [];
                    const found = chapters.find(c => String(c._id || c.id) === String(chapterId));
                    if (found) {
                        setChapterInfo(found);
                        chName = found.chapterName || '';
                    }
                } catch (e) {
                    console.error('Failed to load chapter info', e);
                }

                // 2. Fetch learning content from database (PRIORITY #1)
                const res = await apiClient.get(`/api/learning-content/chapter/${chapterId}`);
                const contents = Array.isArray(res.data) ? res.data : [];
                const trailer = contents.find(c => c.type === 'TRAILER' || c.type === 'VIDEO');

                if (trailer && trailer.driveLink) {
                    const link = trailer.driveLink;
                    setRawUrl(link);

                    if (link.endsWith('.mp4') || link.endsWith('.webm') || link.endsWith('.mkv')) {
                        setVideoSrc(link);
                        setIsVideoNative(true);
                        setLoading(false);
                        return;
                    }

                    // Embedded Google Drive Video / Embed Link
                    setVideoSrc(formatEmbedUrl(link));
                    setIsVideoNative(false);
                    setLoading(false);
                    return;
                }

                // 3. Fallback: Check local video files in public/videos only if no DB link
                const localVideoCandidates = [];
                if (chName.includes('Chapter 2') || chName.includes('Complex Numbers')) {
                    localVideoCandidates.push('/videos/Mathematics/Chapter%202/Basic%20Algebraic%20Properties.mp4');
                } else if (chName.includes('Chapter 1') || chName.includes('Matrices') || chName.includes('Row Echelon')) {
                    localVideoCandidates.push('/videos/Mathematics/Chapter%201/Row%20Echelon%20Form.mp4');
                }

                for (const candidate of localVideoCandidates) {
                    const exists = await checkVideoExists(candidate);
                    if (exists) {
                        setVideoSrc(candidate);
                        setIsVideoNative(true);
                        setLoading(false);
                        return;
                    }
                }

            } catch (err) {
                console.error('ChapterTrailerPage error', err);
            } finally {
                setLoading(false);
            }
        };

        loadTrailer();
    }, [chapterId]);

    const handleContinue = () => {
        navigate(`/chapter/${chapterId}/initial-assessment`);
    };

    const chapterTitle = chapterInfo?.chapterName || 'Chapter Overview';

    return (
        <div className="container" style={{ paddingTop: '5rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(37,99,235,0.12)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    <Film size={16} /> CHAPTER OVERVIEW TRAILER
                </div>
                <h1 className="heading-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>
                    {chapterTitle}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
                    Watch this introductory lecture video before taking the placement assessment.
                </p>
            </div>
            
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', border: '1px solid var(--card-border)' }}>
                {loading ? (
                    <div style={{ height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Loading video lecture...
                    </div>
                ) : isVideoNative ? (
                    <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <video 
                            src={videoSrc} 
                            controls 
                            autoPlay 
                            playsInline
                            style={{ width: '100%', height: '480px', objectFit: 'contain', display: 'block' }}
                        >
                            Your browser does not support HTML5 video playback.
                        </video>
                    </div>
                ) : videoSrc ? (
                    <div>
                        <iframe 
                            src={videoSrc} 
                            width="100%" 
                            height="480" 
                            allow="autoplay; encrypted-media; picture-in-picture" 
                            allowFullScreen
                            style={{ border: 'none', borderRadius: '0.75rem', background: '#000' }} 
                            title="Chapter Trailer Video"
                        ></iframe>
                        {rawUrl && (
                            <div style={{ marginTop: '0.85rem', textAlign: 'right' }}>
                                <a 
                                    href={rawUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--primary)', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                >
                                    Open in Google Drive <ExternalLink size={14} />
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', flexDirection: 'column', gap: '1rem' }}>
                        <PlayCircle size={56} style={{ opacity: 0.4, color: 'var(--primary)' }} />
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.05rem' }}>No video preview available for this chapter.</p>
                    </div>
                )}
            </div>
            
            <motion.button 
                className="btn btn-primary" 
                onClick={handleContinue}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                    padding: '1rem 2.75rem',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    borderRadius: '0.75rem',
                    boxShadow: '0 8px 25px rgba(37,99,235,0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                }}
            >
                <CheckCircle size={20} /> Take Initial Assessment
            </motion.button>
        </div>
    );
};

export default ChapterTrailerPage;
