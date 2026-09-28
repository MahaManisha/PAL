import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swords, CheckCircle, XCircle, Trophy, Clock, Target, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const DuelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [duel, setDuel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Test state
    const [takingTest, setTakingTest] = useState(false);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    
    useEffect(() => {
        fetchDuel();
    }, [id]);

    const fetchDuel = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/api/duels/${id}`);
            setDuel(res.data);
            setAnswers(new Array(res.data.questions.length).fill(null));
        } catch (err) {
            console.error('Error fetching duel:', err);
            setError(err.response?.data?.msg || 'Failed to load duel');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        try {
            setActionLoading(true);
            await apiClient.post(`/api/duels/${id}/accept`);
            fetchDuel();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to accept');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async () => {
        try {
            setActionLoading(true);
            await apiClient.post(`/api/duels/${id}/decline`);
            fetchDuel();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to decline');
        } finally {
            setActionLoading(false);
        }
    };

    const submitAttempt = async () => {
        if (answers.includes(null)) {
            alert('Please answer all questions before submitting.');
            return;
        }
        try {
            setActionLoading(true);
            await apiClient.post(`/api/duels/${id}/submit`, { answers });
            
            // Re-fetch to see updated status
            const res = await apiClient.get(`/api/duels/${id}`);
            setDuel(res.data);
            setTakingTest(false);
            
            if (res.data.status === 'COMPLETED' && res.data.winnerId && res.data.winnerId._id === user.id) {
                triggerConfetti();
            }
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to submit answers');
        } finally {
            setActionLoading(false);
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#10b981', '#f59e0b']
        });
    };

    if (loading) return <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>Loading Duel...</div>;
    
    if (error || !duel) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ color: '#ef4444' }}>{error || 'Duel not found'}</h3>
                    <button className="primary-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isChallenger = duel.challengerId._id === user.id;
    const isOpponent = duel.opponentId._id === user.id;

    // Check if I have already submitted my score
    const myScore = isChallenger ? duel.challengerScore : duel.opponentScore;
    const theirScore = isChallenger ? duel.opponentScore : duel.challengerScore;
    const iHaveSubmitted = myScore !== null;
    const theyHaveSubmitted = theirScore !== null;

    // --- RENDER TEST INTERFACE ---
    if (takingTest && duel.status === 'ACCEPTED' && !iHaveSubmitted) {
        const q = duel.questions[currentQuestionIdx];
        return (
            <div className="container" style={{ paddingTop: '6rem', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Swords color="var(--primary)" /> Mock Test Duel
                    </h2>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>
                        Question {currentQuestionIdx + 1} of {duel.questions.length}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                        {q.questionText}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {q.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    const newAns = [...answers];
                                    newAns[currentQuestionIdx] = idx;
                                    setAnswers(newAns);
                                }}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px',
                                    border: `2px solid ${answers[currentQuestionIdx] === idx ? 'var(--primary)' : 'var(--card-border)'}`,
                                    background: answers[currentQuestionIdx] === idx ? 'rgba(37,99,235,0.05)' : 'transparent',
                                    color: 'var(--text-color)',
                                    textAlign: 'left',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button 
                        className="primary-btn outline"
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(v => v - 1)}
                    >
                        Previous
                    </button>
                    {currentQuestionIdx === duel.questions.length - 1 ? (
                        <button 
                            className="primary-btn"
                            disabled={actionLoading || answers.includes(null)}
                            onClick={submitAttempt}
                        >
                            {actionLoading ? 'Submitting...' : 'Submit Final Answers'}
                        </button>
                    ) : (
                        <button 
                            className="primary-btn"
                            onClick={() => setCurrentQuestionIdx(v => v + 1)}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER DUEL STATUS / RESULTS ---
    return (
        <div className="container" style={{ paddingTop: '6rem', maxWidth: '800px', paddingBottom: '4rem' }}>
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Swords size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Mock Test Duel</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Subject: <strong>{duel.subjectId.name}</strong>
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginBottom: '3rem' }}>
                    {/* Challenger */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', border: duel.winnerId?._id === duel.challengerId._id ? '4px solid #f59e0b' : 'none' }}>
                            {duel.challengerId.name.charAt(0).toUpperCase()}
                        </div>
                        <strong style={{ fontSize: '1.2rem' }}>{duel.challengerId.name}</strong>
                        {duel.status === 'COMPLETED' && (
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: duel.winnerId?._id === duel.challengerId._id ? '#10b981' : 'var(--text-color)' }}>
                                {duel.challengerScore}/{duel.questions.length}
                            </div>
                        )}
                        {(duel.status === 'ACCEPTED' || duel.status === 'PENDING') && duel.challengerScore !== null && (
                            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}><CheckCircle size={16}/> Finished</div>
                        )}
                    </div>

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-muted)', opacity: 0.5 }}>VS</div>

                    {/* Opponent */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f43f5e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', border: duel.winnerId?._id === duel.opponentId._id ? '4px solid #f59e0b' : 'none' }}>
                            {duel.opponentId.name.charAt(0).toUpperCase()}
                        </div>
                        <strong style={{ fontSize: '1.2rem' }}>{duel.opponentId.name}</strong>
                        {duel.status === 'COMPLETED' && (
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: duel.winnerId?._id === duel.opponentId._id ? '#10b981' : 'var(--text-color)' }}>
                                {duel.opponentScore}/{duel.questions.length}
                            </div>
                        )}
                        {(duel.status === 'ACCEPTED' || duel.status === 'PENDING') && duel.opponentScore !== null && (
                            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}><CheckCircle size={16}/> Finished</div>
                        )}
                    </div>
                </div>

                {/* Status Messages & Actions */}
                <div style={{ padding: '2rem', background: 'var(--bg-color)', borderRadius: '16px' }}>
                    {duel.status === 'PENDING' && (
                        <div>
                            {isOpponent ? (
                                <>
                                    <h3 style={{ margin: '0 0 1.5rem 0' }}>You have been challenged!</h3>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                        <button className="primary-btn" style={{ background: '#10b981' }} onClick={handleAccept} disabled={actionLoading}>Accept Challenge</button>
                                        <button className="primary-btn" style={{ background: '#ef4444' }} onClick={handleDecline} disabled={actionLoading}>Decline</button>
                                    </div>
                                </>
                            ) : (
                                <h3 style={{ color: 'var(--text-muted)' }}>Waiting for {duel.opponentId.name} to accept...</h3>
                            )}
                        </div>
                    )}

                    {duel.status === 'DECLINED' && (
                        <h3 style={{ color: '#ef4444' }}>Challenge was declined.</h3>
                    )}

                    {duel.status === 'ACCEPTED' && (
                        <div>
                            {iHaveSubmitted ? (
                                <div>
                                    <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <CheckCircle /> You have submitted your answers!
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Waiting for {isChallenger ? duel.opponentId.name : duel.challengerId.name} to finish...</p>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ marginBottom: '1.5rem' }}>Challenge Accepted!</h3>
                                    <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>You will face 5 multiple-choice questions. Do your best!</p>
                                    <button className="primary-btn" onClick={() => setTakingTest(true)} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                                        Start Duel Now
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {duel.status === 'COMPLETED' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                {duel.winnerId ? (
                                    <Trophy size={64} style={{ color: '#f59e0b' }} />
                                ) : (
                                    <AlertTriangle size={64} style={{ color: 'var(--text-muted)' }} />
                                )}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: duel.winnerId?._id === user.id ? '#10b981' : (duel.winnerId ? '#ef4444' : 'var(--text-color)') }}>
                                {duel.winnerId === null ? "It's a Draw!" : (duel.winnerId._id === user.id ? 'You Won!' : 'You Lost!')}
                            </h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                                <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1rem 2rem', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Accuracy</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Math.round((myScore / duel.questions.length) * 100)}%</div>
                                </div>
                                <div style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '1rem 2rem', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>XP Earned</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                        +{duel.winnerId === null ? 10 : (duel.winnerId._id === user.id ? 20 : 5)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuelDetails;
