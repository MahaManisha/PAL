import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, BarChart2, Flame, Award, Ticket, Star, Zap, X, Check, HelpCircle } from 'lucide-react';

const getRewardConfig = (interest) => {
    switch (interest) {
        case 'gameified':
            return { label: 'Streak', icon: <Flame size={22} color="#ec4899" />, key: 'streak', unit: 'day streak 🔥', color: '#ec4899' };
        case 'movie':
            return { label: 'Tokens', icon: <Ticket size={22} color="#f5c518" />, key: 'tokens', unit: 'tokens 🎟️', color: '#f5c518' };
        default:
            return { label: 'Points', icon: <Award size={22} color="#2563eb" />, key: 'points', unit: 'pts ⭐', color: '#2563eb' };
    }
};

const DailyQuestModal = ({ quest, onClose, onSubmit, submitted, result }) => {
    const [selected, setSelected] = useState(null);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '540px', position: 'relative' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Zap size={20} color="var(--primary)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        GATE-Level Daily Challenge
                    </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--text)' }}>
                    {quest.questionText}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {quest.options.map((opt, i) => {
                        let border = '1px solid var(--card-border)';
                        let bg = 'rgba(255,255,255,0.03)';
                        if (submitted && result) {
                            if (i === result.correctAnswer) { border = '1px solid #22c55e'; bg = 'rgba(34,197,94,0.1)'; }
                            else if (i === selected && i !== result.correctAnswer) { border = '1px solid #ef4444'; bg = 'rgba(239,68,68,0.1)'; }
                        } else if (selected === i) {
                            border = '1px solid var(--primary)';
                            bg = 'rgba(99,102,241,0.1)';
                        }
                        return (
                            <button key={i} disabled={submitted}
                                onClick={() => !submitted && setSelected(i)}
                                style={{
                                    padding: '0.85rem 1rem', textAlign: 'left',
                                    cursor: submitted ? 'default' : 'pointer',
                                    background: bg, border, borderRadius: '0.6rem',
                                    color: 'var(--text)', fontSize: '0.95rem',
                                    transition: 'all 0.2s', width: '100%'
                                }}
                            >
                                <span style={{ fontWeight: 700, marginRight: '0.5rem', color: 'var(--primary)' }}>
                                    {String.fromCharCode(65 + i)}.
                                </span>
                                {opt}
                                {submitted && result && i === result.correctAnswer &&
                                    <Check size={14} style={{ float: 'right', color: '#22c55e', marginTop: '3px' }} />}
                            </button>
                        );
                    })}
                </div>

                {submitted && result ? (
                    <div style={{
                        padding: '1rem', borderRadius: '0.6rem', textAlign: 'center',
                        background: result.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: result.isCorrect ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'
                    }}>
                        {result.isCorrect
                            ? <p style={{ color: '#22c55e', fontWeight: 700 }}>✅ Correct! You earned +1 daily reward!</p>
                            : <p style={{ color: '#ef4444', fontWeight: 700 }}>❌ Incorrect. Better luck tomorrow!</p>}
                    </div>
                ) : (
                    <button className="btn btn-primary"
                        onClick={() => selected !== null && onSubmit(selected)}
                        disabled={selected === null}
                        style={{ width: '100%', opacity: selected === null ? 0.5 : 1 }}
                    >
                        Submit Answer
                    </button>
                )}
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const { user, logout, updateUserInterest, updateUserStats } = useContext(AuthContext);
    const [subjects, setSubjects] = useState([]);
    const [progress, setProgress] = useState([]);
    const [dailyQuest, setDailyQuest] = useState(null);
    const [questModalOpen, setQuestModalOpen] = useState(false);
    const [questSubmitted, setQuestSubmitted] = useState(false);
    const [questResult, setQuestResult] = useState(null);

    const rewardConfig = getRewardConfig(user?.interest);
    const rewardValue = user?.[rewardConfig.key] || 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, progRes, questRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/subjects'),
                    axios.get(`http://localhost:5000/api/progress/${user.id}`),
                    axios.get(`http://localhost:5000/api/assessment/daily-quest/${user.id}`)
                ]);
                setSubjects(subRes.data);
                setProgress(progRes.data);
                setDailyQuest(questRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [user.id]);

    const passedTopics = progress.filter(p => p.status === 'pass').length;

    const handleDailyQuestSubmit = async (answerIndex) => {
        try {
            const res = await axios.post('http://localhost:5000/api/assessment/daily-quest/submit', {
                userId: user.id,
                questionId: dailyQuest.question.id,
                answer: answerIndex
            });
            setQuestResult(res.data);
            setQuestSubmitted(true);
            if (res.data.isCorrect && res.data.userStats) {
                updateUserStats(res.data.userStats);
                setDailyQuest(prev => ({ ...prev, alreadyCompleted: true }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <AnimatePresence>
                {questModalOpen && dailyQuest?.question && (
                    <DailyQuestModal
                        quest={dailyQuest.question}
                        onClose={() => setQuestModalOpen(false)}
                        onSubmit={handleDailyQuestSubmit}
                        submitted={questSubmitted || dailyQuest.alreadyCompleted}
                        result={questResult}
                    />
                )}
            </AnimatePresence>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 className="heading-gradient" style={{ fontSize: '2.5rem' }}>Welcome, {user.name}!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Ready to advance your learning today?</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={user.interest || 'professional'}
                        onChange={(e) => updateUserInterest(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem', background: 'var(--input-bg)',
                            border: '1px solid var(--input-border)', borderRadius: '0.5rem',
                            color: 'var(--text)', cursor: 'pointer', outline: 'none', fontSize: '0.9rem'
                        }}
                    >
                        <option value="professional">⚡ Professional</option>
                        <option value="gameified">🎮 Gameified</option>
                        <option value="movie">🎬 Movie</option>
                    </select>
                    <button onClick={logout} className="btn" style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>Logout</button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {subjects.map((subject) => (
                        <Link key={subject._id} to={`/subject/${subject._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <motion.div whileHover={{ scale: 1.02 }} className="glass-card" style={{ height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(99,102,241,0.15)' }}>
                                        <Book color="var(--primary)" />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', color: 'var(--text)' }}>{subject.name}</h3>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Explore chapters and unlock topics in {subject.name}.
                                </p>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Reward Badge */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            {rewardConfig.icon}
                            <h3 style={{ color: 'var(--text)' }}>{rewardConfig.label}</h3>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
                            <motion.div
                                key={rewardValue}
                                initial={{ scale: 1.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ fontSize: '3.5rem', fontWeight: 900, color: rewardConfig.color, lineHeight: 1 }}
                            >
                                {rewardValue}
                            </motion.div>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{rewardConfig.unit}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <BarChart2 size={14} />
                            <span>{passedTopics} topics completed</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(128,128,128,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(passedTopics * 10, 100)}%`, height: '100%', background: rewardConfig.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                        </div>
                    </div>

                    {/* Daily Quest Card */}
                    <motion.div className="glass-card" style={{ padding: '1.5rem' }} whileHover={{ scale: 1.01 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Zap size={20} color="var(--primary)" />
                            <h3 style={{ color: 'var(--text)' }}>Daily Challenge</h3>
                            <span style={{
                                marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                                borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>GATE</span>
                        </div>

                        {dailyQuest?.alreadyCompleted ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Quest Completed!</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                                    Come back tomorrow for a new challenge!
                                </p>
                            </div>
                        ) : dailyQuest?.question ? (
                            <div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                    🔬 {dailyQuest.question.topic} · Hard level
                                </p>
                                <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1rem' }}>
                                    {dailyQuest.question.questionText.length > 80
                                        ? dailyQuest.question.questionText.substring(0, 80) + '...'
                                        : dailyQuest.question.questionText}
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { setQuestModalOpen(true); setQuestSubmitted(false); setQuestResult(null); }}
                                    style={{ width: '100%' }}
                                >
                                    <Star size={16} style={{ marginRight: '0.4rem' }} />
                                    Attempt (+1 {rewardConfig.label})
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.9rem' }}>
                                <HelpCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Loading today's challenge...</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
