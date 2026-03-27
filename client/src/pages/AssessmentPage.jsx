import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AssessmentPage = () => {
    const { topicId } = useParams();
    const { user } = useContext(AuthContext);
    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/assessment/${topicId}`);
                setAssessment(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [topicId]);

    const handleOptionSelect = (qIdx, oIdx) => {
        setAnswers({ ...answers, [qIdx]: oIdx });
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/assessment/submit', {
                userId: user.id,
                topicId,
                answers: Object.values(answers)
            });

            if (res.data.status === 'pass') {
                alert(`Congratulations! You passed with ${res.data.score}%`);
                navigate('/dashboard');
            } else {
                alert(`Score: ${res.data.score}%. You need 70% to pass. Let's review the slides.`);
                // We need more info for the slides URL (subject/chapter/topic)
                // Short term: just go to a placeholder slide page or fetch topic detail
                const topicDetails = await axios.get(`http://localhost:5000/api/topics/detail/${topicId}`);
                // Simplified redirect logic
                navigate(`/slides/general/chapter/topic`); // Placeholder for now or actual params
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="container">Loading Assessment...</div>;
    if (!assessment) return <div className="container">No assessment found for this topic.</div>;

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <h2 style={{ marginBottom: '2rem' }}>Topic Assessment</h2>
            {assessment.questions.map((q, qIdx) => (
                <div key={qIdx} className="glass-card" style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{q.questionText}</p>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {q.options.map((opt, oIdx) => (
                            <button
                                key={oIdx}
                                onClick={() => handleOptionSelect(qIdx, oIdx)}
                                className="btn"
                                style={{
                                    justifyContent: 'flex-start',
                                    background: answers[qIdx] === oIdx ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: answers[qIdx] === oIdx ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
                disabled={Object.keys(answers).length < assessment.questions.length}
            >
                Submit Assessment
            </button>
        </div>
    );
};

export default AssessmentPage;
