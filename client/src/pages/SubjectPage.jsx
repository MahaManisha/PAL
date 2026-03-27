import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Lock, Unlock } from 'lucide-react';

const SubjectPage = () => {
    const { id } = useParams();
    const [chapters, setChapters] = useState([]);
    const [expandedChapter, setExpandedChapter] = useState(null);

    useEffect(() => {
        const fetchChapters = async () => {
            const res = await axios.get(`http://localhost:5000/api/chapters/${id}`);
            setChapters(res.data);
        };
        fetchChapters();
    }, [id]);

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <Link to="/dashboard" className="btn" style={{ marginBottom: '2rem', paddingLeft: 0 }}>← Back to Dashboard</Link>
            <h2 className="heading-gradient" style={{ fontSize: '3rem', marginBottom: '3rem' }}>Chapters</h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {chapters.map((chapter) => (
                    <div key={chapter._id}>
                        <div
                            onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                            className="glass-card"
                            style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        >
                            <h3 style={{ fontSize: '1.25rem' }}>{chapter.chapterName}</h3>
                            {expandedChapter === chapter._id ? <ChevronDown /> : <ChevronRight />}
                        </div>
                        <AnimatePresence>
                            {expandedChapter === chapter._id && (
                                <TopicsList chapterId={chapter._id} />
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopicsList = ({ chapterId }) => {
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            const res = await axios.get(`http://localhost:5000/api/topics/${chapterId}`);
            setTopics(res.data);
        };
        fetchTopics();
    }, [chapterId]);

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', padding: '0.5rem 1rem' }}
        >
            {topics.map((topic, i) => (
                <Link key={topic._id} to={`/topic/${topic._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {i + 1}
                        </div>
                        <span>{topic.topicName}</span>
                    </div>
                </Link>
            ))}
        </motion.div>
    );
};

export default SubjectPage;
