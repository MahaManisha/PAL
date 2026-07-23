import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Lock, Unlock, CheckCircle, Clock, PlayCircle, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SubjectPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [subject, setSubject] = useState({ name: 'Subject' });
    const [chapters, setChapters] = useState([]);
    const [topicsByChapter, setTopicsByChapter] = useState({});
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subject details (if available, else fallback)
                const subRes = await axios.get('http://localhost:5000/api/subjects').catch(() => ({ data: [] }));
                const currentSub = subRes.data.find(s => s._id === id);
                if (currentSub) setSubject(currentSub);

                // Fetch progress
                const progRes = await axios.get(`http://localhost:5000/api/progress/${user.id}`);
                setProgress(progRes.data);

                // Fetch chapters
                const chapRes = await axios.get(`http://localhost:5000/api/chapters/${id}`);
                const fetchedChapters = chapRes.data;
                
                // Fetch topics for all chapters
                const topicPromises = fetchedChapters.map(c => axios.get(`http://localhost:5000/api/topics/${c._id}`));
                const topicResponses = await Promise.all(topicPromises);
                
                const topicsMap = {};
                fetchedChapters.forEach((c, index) => {
                    topicsMap[c._id] = topicResponses[index].data;
                });
                
                setChapters(fetchedChapters);
                setTopicsByChapter(topicsMap);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching subject data:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user.id]);

    const isTopicPassed = (topicId) => {
        return progress.some(p => p.topicId === topicId && p.status === 'pass');
    };

    const isChapterPassed = (chapterId) => {
        const topics = topicsByChapter[chapterId] || [];
        if (topics.length === 0) return false;
        // Check if all topics in chapter are passed
        return topics.every(t => isTopicPassed(t._id));
    };

    const getChapterCompletionPercentage = (chapterId) => {
        const topics = topicsByChapter[chapterId] || [];
        if (topics.length === 0) return 0;
        const passedCount = topics.filter(t => isTopicPassed(t._id)).length;
        return Math.round((passedCount / topics.length) * 100);
    };

    // Determine if a chapter is unlocked. 
    // Chapter 0 is always unlocked. Chapter N is unlocked if Chapter N-1 is passed.
    const isChapterUnlocked = (index) => {
        if (index === 0) return true;
        const prevChapterId = chapters[index - 1]._id;
        return isChapterPassed(prevChapterId);
    };

    if (loading) {
        return <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>Loading roadmap...</div>;
    }

    return (
        <div className="container" style={{ paddingTop: '6rem' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '1rem', color: '#2563eb' }}>
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h2 className="heading-gradient" style={{ fontSize: '2.5rem' }}>{subject.name} Roadmap</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Master each chapter to unlock the next level.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', position: 'relative' }}>
                {/* Visual connection line */}
                <div style={{ position: 'absolute', left: '2rem', top: '2rem', bottom: '2rem', width: '2px', background: 'var(--card-border)', zIndex: 0 }}></div>

                {chapters.map((chapter, index) => {
                    const unlocked = isChapterUnlocked(index);
                    const passed = isChapterPassed(chapter._id);
                    const percentage = getChapterCompletionPercentage(chapter._id);
                    const topics = topicsByChapter[chapter._id] || [];

                    let statusColor = 'var(--text-muted)';
                    let statusBg = 'var(--surface)';
                    let icon = <Lock size={20} />;

                    if (passed) {
                        statusColor = '#10b981';
                        statusBg = 'rgba(16, 185, 129, 0.1)';
                        icon = <CheckCircle size={20} />;
                    } else if (unlocked) {
                        statusColor = 'var(--primary)';
                        statusBg = 'rgba(37, 99, 235, 0.1)';
                        icon = <Unlock size={20} />;
                    }

                    return (
                        <div key={chapter._id} style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1.5rem' }}>
                            {/* Roadmap Node */}
                            <div style={{ 
                                width: '4rem', height: '4rem', borderRadius: '50%', 
                                background: statusBg, border: `2px solid ${statusColor}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: statusColor, flexShrink: 0, marginTop: '1rem'
                            }}>
                                {icon}
                            </div>

                            {/* Chapter Card */}
                            <div className="glass-card" style={{ flexGrow: 1, padding: '1.5rem', border: unlocked ? `1px solid ${statusColor}` : '1px solid var(--card-border)', opacity: unlocked ? 1 : 0.6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Chapter {index + 1}
                                            </span>
                                            {!unlocked && <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>Prerequisite Required</span>}
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem' }}>{chapter.chapterName}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            <Clock size={16} /> Est. Time: {topics.length * 1.5}h
                                        </div>
                                        <div style={{ fontWeight: 600, color: statusColor }}>
                                            {percentage}% Completed
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ height: '6px', background: 'rgba(128,128,128,0.2)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    <div style={{ width: `${percentage}%`, height: '100%', background: statusColor, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                                </div>

                                {/* Topics List */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {topics.map((topic, i) => {
                                        const topicPassed = isTopicPassed(topic._id);
                                        return (
                                            <Link 
                                                key={topic._id} 
                                                to={unlocked ? `/topic/${topic._id}` : '#'}
                                                style={{ textDecoration: 'none', pointerEvents: unlocked ? 'auto' : 'none' }}
                                            >
                                                <div style={{ 
                                                    padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                    border: topicPassed ? '1px solid #10b981' : '1px solid transparent',
                                                    transition: 'all 0.2s', cursor: unlocked ? 'pointer' : 'not-allowed'
                                                }}>
                                                    <div style={{ color: topicPassed ? '#10b981' : (unlocked ? 'var(--primary)' : 'var(--text-muted)') }}>
                                                        {topicPassed ? <CheckCircle size={18} /> : <PlayCircle size={18} />}
                                                    </div>
                                                    <span style={{ color: unlocked ? 'var(--text)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                        {i + 1}. {topic.topicName}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectPage;
