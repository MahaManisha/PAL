import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { HelpCircle, Play } from 'lucide-react';

const TopicPage = () => {
    const { id } = useParams();
    const [topic, setTopic] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopic = async () => {
            // Need a single topic endpoint or just filter (minimalist approach)
            const chapterRes = await axios.get(`http://localhost:5000/api/topics/${id}`); // Assuming ID is searchable
            // Note: My routes are /topics/:chapterId. I should add /topics/detail/:topicId
            // For now, I'll fetch and find or I should update the backend.
            // I'll update the backend briefly to support fetching a single topic by ID.
        };
        // Quick workaround: Just navigate to assessment directly or get detail
    }, [id]);

    return (
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <HelpCircle size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Assessment Ready</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Prove your mastery of this topic. Score at least 70% to unlock the next level.
                    If you struggle, don't worry—we'll provide learning materials.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to={`/assessment/${id}`} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
                        Start Assessment <Play size={18} fill="currentColor" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default TopicPage;
