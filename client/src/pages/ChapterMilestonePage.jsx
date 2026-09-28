import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles, Trophy, CheckCircle, ArrowRight, BookOpen,
    Award, Zap, Flame, Star, Target, ShieldCheck, RefreshCw, ArrowLeft
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { normalizeId } from '../utils/progressionEngine';

const ChapterMilestonePage = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { themeConfig } = useTheme();

    const [chapter, setChapter] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    const terminology = themeConfig?.terminology || { chapter: 'Chapter', topic: 'Topic', assessment: 'Assessment' };
    const experience = themeConfig?.experience || 'professional';

    useEffect(() => {
        const fetchMilestoneData = async () => {
            if (!chapterId) return;
            setLoading(true);
            try {
                // Fetch chapter details & topics
                const chapRes = await apiClient.get(`/api/chapters/detail/${chapterId}`).catch(() => null);
                let chapData = chapRes?.data;

                if (!chapData) {
                    // Fallback fetch if detail endpoint is standard
                    const allChaps = await apiClient.get('/api/chapters/all').catch(() => ({ data: [] }));
                    chapData = (allChaps.data || []).find(c => normalizeId(c._id || c.id) === normalizeId(chapterId));
                }

                setChapter(chapData);

                const topicsRes = await apiClient.get(`/api/topics/${normalizeId(chapterId)}`).catch(() => ({ data: [] }));
                const topicList = Array.isArray(topicsRes.data) ? [...topicsRes.data] : [];
                topicList.sort((a, b) => (a.order || 0) - (b.order || 0));
                setTopics(topicList);

                if (topicList.length > 0) {
                    const detailRes = await apiClient.get(`/api/topics/detail/${topicList[0]._id || topicList[0].id}`).catch(() => null);
                    if (detailRes?.data?.chapterId) {
                        setChapter(detailRes.data.chapterId);
                    }
                }

            } catch (err) {
                console.error('ChapterMilestonePage: Error fetching data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMilestoneData();
    }, [chapterId]);

    const subjectIdStr = chapter?.subjectId?._id
        ? String(chapter.subjectId._id)
        : (chapter?.subjectId ? String(chapter.subjectId) : null);

    const chapterName = chapter?.chapterName || `${terminology.chapter} Micro-Content`;

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                    <Sparkles size={40} className="micro-sparkle" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading milestone celebration...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '4rem', maxWidth: '880px', margin: '0 auto', paddingBottom: '6rem' }}>
            
            {/* Top Navigation */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'var(--surface)', border: '1px solid var(--card-border)',
                        borderRadius: '999px', padding: '0.45rem 1rem',
                        color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{
                    padding: '0.4rem 1rem', borderRadius: '999px',
                    background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#22c55e', fontWeight: 800, fontSize: '0.82rem',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    display: 'inline-flex', alignItems: 'center', gap: '0.45rem'
                }}>
                    <ShieldCheck size={15} /> Micro-Content Milestone Reached
                </div>
            </div>

            {/* Main Milestone Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                className="glass-card"
                style={{
                    padding: '3.5rem 2.5rem', borderRadius: '1.75rem',
                    textAlign: 'center', position: 'relative', overflow: 'hidden',
                    background: 'var(--surface)', border: '1.5px solid var(--card-border)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
                }}
            >
                {/* Decorative Background Accent */}
                <div style={{
                    position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
                    width: '320px', height: '320px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(34, 197, 94, 0.15) 50%, transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0
                }} />

                {/* Celebration Icon Header */}
                <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.15 }}
                    style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem', display: 'inline-block' }}
                >
                    <div style={{
                        padding: '1.5rem', borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(99, 102, 241, 0.18))',
                        border: '2px solid rgba(34, 197, 94, 0.4)',
                        display: 'inline-flex', color: '#22c55e',
                        boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)'
                    }}>
                        <Trophy size={68} />
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                        <Sparkles size={18} /> Milestone Achieved
                    </div>

                    <h1 className="heading-gradient" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.15 }}>
                        Awesome! 🎉
                    </h1>

                    {/* Prominent Motivational Card */}
                    <div style={{
                        maxWidth: '680px', margin: '0 auto 2.5rem', padding: '1.75rem 2rem',
                        borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(34, 197, 94, 0.1))',
                        border: '1.5px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                    }}>
                        <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                            You have completed all micro-content for <span style={{ color: 'var(--primary)' }}>{chapterName}</span>!
                        </p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                            💪 <strong style={{ color: '#22c55e' }}>Your base is strong!</strong> Keep going with the elaborated content to achieve complete chapter mastery.
                        </p>
                    </div>
                </motion.div>

                {/* 3 Key Stats / Accomplishments Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.25rem', marginBottom: '3rem', position: 'relative', zIndex: 1
                    }}
                >
                    {/* Stat 1 */}
                    <div style={{
                        padding: '1.25rem', borderRadius: '1rem',
                        background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#22c55e', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>
                            <CheckCircle size={28} />
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                            {topics.length} / {topics.length} Topics
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                            Micro-Content Completed
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div style={{
                        padding: '1.25rem', borderRadius: '1rem',
                        background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#f59e0b', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>
                            <Flame size={28} />
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                            Strong Base
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                            Foundation Ready
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div style={{
                        padding: '1.25rem', borderRadius: '1rem',
                        background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>
                            <Zap size={28} />
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                            Next Phase
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                            Elaborated Presentation
                        </div>
                    </div>
                </motion.div>

                {/* Primary Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}
                >
                    {/* Primary Button: Elaborated Presentation (Main PPT) */}
                    <Link
                        to={`/chapter/${chapterId}/main-content`}
                        className="btn btn-primary"
                        style={{
                            padding: '1.1rem 2.2rem', fontSize: '1.05rem', fontWeight: 800,
                            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                            borderRadius: '0.85rem'
                        }}
                    >
                        <BookOpen size={22} />
                        Proceed to Elaborated Content
                        <ArrowRight size={20} />
                    </Link>

                    {/* Secondary Button: Chapter Final Assessment */}
                    <Link
                        to={`/chapter/${chapterId}/final-assessment`}
                        className="btn"
                        style={{
                            padding: '1.1rem 1.8rem', fontSize: '1rem', fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                            background: 'var(--surface)', border: '1px solid var(--card-border)',
                            color: 'var(--text)', borderRadius: '0.85rem'
                        }}
                    >
                        <Target size={20} color="var(--primary)" />
                        Take Chapter Final Assessment
                    </Link>

                    {/* Tertiary Button: Return to Roadmap */}
                    {subjectIdStr && (
                        <Link
                            to={`/subject/${subjectIdStr}`}
                            className="btn"
                            style={{
                                padding: '1.1rem 1.5rem', fontSize: '0.95rem', fontWeight: 600,
                                background: 'transparent', border: '1px solid var(--card-border)',
                                color: 'var(--text-muted)', borderRadius: '0.85rem'
                            }}
                        >
                            Return to Roadmap
                        </Link>
                    )}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default ChapterMilestonePage;
