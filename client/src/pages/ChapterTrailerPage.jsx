import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ChapterTrailerPage = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const [trailerUrl, setTrailerUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await apiClient.get(`/api/learning-content/chapter/${chapterId}`);
                const trailer = res.data.find(c => c.type === 'TRAILER');
                if (trailer && trailer.driveLink) {
                    setTrailerUrl(trailer.driveLink);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchContent();
    }, [chapterId]);

    const handleContinue = () => {
        navigate(`/chapter/${chapterId}/initial-assessment`);
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="heading-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Chapter Trailer</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Watch this 5-minute overview before starting the assessment.</p>
            
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Video...</div>
                ) : trailerUrl ? (
                    <iframe 
                        src={trailerUrl} 
                        width="100%" 
                        height="450" 
                        allow="autoplay" 
                        style={{ border: 'none', borderRadius: '0.5rem' }} 
                        title="Chapter Trailer"
                    ></iframe>
                ) : (
                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                        <PlayCircle size={48} style={{ opacity: 0.5 }} />
                        <p style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>Trailer video not available.</p>
                    </div>
                )}
            </div>
            
            <motion.button 
                className="btn btn-primary" 
                onClick={handleContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
            >
                Take Initial Assessment
            </motion.button>
        </div>
    );
};

export default ChapterTrailerPage;
