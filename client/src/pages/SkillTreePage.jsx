import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProgression } from '../hooks/useProgression';
import { useNextAction } from '../hooks/useNextAction';
import { normalizeId } from '../utils/progressionEngine';
import AiTutorWidget from '../components/AiTutorWidget';
import { 
    Map, ChevronDown, CheckCircle, Lock, PlayCircle, BookOpen, 
    Zap, Target, ShieldAlert, Award, ChevronRight, X, Sparkles
} from 'lucide-react';

// Topic state config mapping (reusing logic from ChapterCard)
function getTopicStateConfig(state, terminology = {}) {
    switch (state) {
        case 'PASSED':
        case 'SKIPPED':
            return { Icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: terminology.complete || 'Completed', border: '#10b981' };
        case 'NEEDS_REVISION':
            return { Icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Needs Revision', border: '#ef4444' };
        case 'ASSESSMENT_READY':
            return { Icon: Target, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: terminology.assessment || 'Assessment Ready', border: '#f59e0b' };
        case 'PRACTICING':
            return { Icon: Zap, color: 'var(--primary)', bg: 'rgba(37,99,235,0.15)', label: 'Practicing', border: 'var(--primary)' };
        case 'LEARNING':
            return { Icon: BookOpen, color: 'var(--primary)', bg: 'rgba(37,99,235,0.15)', label: 'Learning', border: 'var(--primary)' };
        case 'LOCKED':
            return { Icon: Lock, color: 'var(--text-muted)', bg: 'var(--surface)', label: terminology.locked || 'Locked', border: 'var(--card-border)' };
        case 'NOT_STARTED':
        default:
            return { Icon: PlayCircle, color: 'var(--text-muted)', bg: 'var(--surface)', label: 'Not Started', border: 'var(--card-border)' };
    }
}

const ACTION_LABELS = {
    START_TOPIC: { default: 'Start Topic', gamified: 'Begin Quest', cinematic: 'Enter Scene' },
    CONTINUE_LEARNING: { default: 'Continue Learning', gamified: 'Resume Quest', cinematic: 'Continue Scene' },
    START_PRACTICE: { default: 'Start Practice', gamified: 'Practice Skill', cinematic: 'Rehearse Scene' },
    TAKE_ASSESSMENT: { default: 'Take Assessment', gamified: 'Challenge Boss Battle', cinematic: 'Enter Audition' },
    REVIEW_TOPIC: { default: 'Review Topic', gamified: 'Review Quest Material', cinematic: 'Review Scene Notes' },
    RETRY_ASSESSMENT: { default: 'Retry Assessment', gamified: 'Retry Boss Battle', cinematic: 'Retry Audition' },
    START_NEXT_TOPIC: { default: 'Next Topic', gamified: 'Next Quest', cinematic: 'Next Scene' },
    START_NEXT_CHAPTER: { default: 'Start Next Chapter', gamified: 'Unlock Next Level', cinematic: 'Begin Next Act' },
    START_INITIAL_ASSESSMENT: { default: 'Start Initial Assessment', gamified: 'Take Placement Test', cinematic: 'Enter Placement' }
};

function getCtaLabel(actionType, experience) {
    const labels = ACTION_LABELS[actionType];
    if (!labels) return 'Continue';
    return labels[experience] || labels.default;
}

const SkillTreePage = () => {
    const { user } = useContext(AuthContext);
    const { themeConfig } = useTheme();
    const terminology = themeConfig?.terminology || {};
    const experience = themeConfig?.experience || 'professional';
    
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(null); // { topic, chapter, state, config, progressDetails }

    const { nextAction: globalNextAction, isLoading: isLoadingNextAction } = useNextAction();

    // Fetch subjects on mount
    useEffect(() => {
        apiClient.get('/api/subjects').then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubjectId(normalizeId(data[0]._id || data[0].id));
            }
        }).catch(err => console.error("Failed to load subjects", err));
    }, []);

    // Progression Engine hook
    const {
        loading, error, chapters, nextAction, getChapterState, getTopicState, getMasteryBandForTopic
    } = useProgression(selectedSubjectId);

    // Topic click handler
    const handleTopicClick = (topic, chapter) => {
        const state = getTopicState(topic, chapter);
        const config = getTopicStateConfig(state, terminology);
        const masteryBand = getMasteryBandForTopic(normalizeId(topic._id || topic.id));
        
        let ctaAction = null;
        // If it's the exact topic recommended by AI, use that action
        if (nextAction && nextAction.topicId === normalizeId(topic._id || topic.id)) {
            ctaAction = nextAction;
        } else if (state !== 'LOCKED') {
            // Determine fallback action based on state
            let type = 'START_TOPIC';
            if (state === 'LEARNING') type = 'CONTINUE_LEARNING';
            if (state === 'PRACTICING') type = 'START_PRACTICE';
            if (state === 'ASSESSMENT_READY') type = 'TAKE_ASSESSMENT';
            if (state === 'NEEDS_REVISION') type = 'REVIEW_TOPIC';
            if (state === 'PASSED' || state === 'SKIPPED') type = 'REVIEW_TOPIC';

            ctaAction = {
                type,
                route: (type === 'TAKE_ASSESSMENT') ? `/assessment/${normalizeId(topic._id || topic.id)}` : `/topic/${normalizeId(topic._id || topic.id)}`,
            };
        }

        setSelectedTopic({ topic, chapter, state, config, masteryBand, ctaAction });
    };

    if (subjects.length === 0 && !loading) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '3rem' }}>No subjects available.</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* ── Header & Subject Selector ── */}
            <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.15)', borderRadius: '1.2rem', color: 'var(--primary)' }}>
                        <Map size={36} />
                    </div>
                    <div>
                        <h1 className="heading-gradient" style={{ fontSize: '2.8rem', margin: 0, letterSpacing: '-0.02em' }}>Learning Roadmap</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0 0 0', fontSize: '1.1rem' }}>Your personalized journey and skill tree.</p>
                    </div>
                </div>

                {/* Subject Tabs */}
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                    {subjects.map(subj => {
                        const sId = normalizeId(subj._id || subj.id);
                        const isSelected = selectedSubjectId === sId;
                        return (
                            <button
                                key={sId}
                                onClick={() => setSelectedSubjectId(sId)}
                                style={{
                                    padding: '0.75rem 1.75rem', borderRadius: '99px',
                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                    background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--surface)',
                                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: isSelected ? 700 : 500,
                                    fontSize: '1.05rem',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.15)' : 'none'
                                }}
                            >
                                {subj.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── AI Recommendation Banner ── */}
            {nextAction && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        width: '100%', maxWidth: '1000px', marginBottom: '4rem',
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08))',
                        border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px',
                        padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '2rem', flexWrap: 'wrap',
                        boxShadow: '0 8px 32px rgba(37,99,235,0.05)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>AI Recommended Next</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{nextAction.title}</div>
                            <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{nextAction.description}</div>
                        </div>
                    </div>
                    {nextAction.route && (
                        <Link to={nextAction.route} className="btn btn-primary" style={{ borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700 }}>
                            {getCtaLabel(nextAction.type, experience)} <ChevronRight size={20} />
                        </Link>
                    )}
                </motion.div>
            )}

            {/* ── Skill Tree Content ── */}
            <div style={{ width: '100%', maxWidth: '1000px', position: 'relative' }}>
                {/* Next Best Action Banner */}
            {!isLoadingNextAction && globalNextAction && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card" 
                    style={{ 
                        padding: '1.5rem 2rem', 
                        marginBottom: '3rem', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        width: '100%',
                        maxWidth: '800px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {globalNextAction.type === 'REMEDIATION' ? <Zap size={24} color="#fff" /> : 
                             globalNextAction.type === 'CONTINUE' ? <BookOpen size={24} color="#fff" /> :
                             globalNextAction.type === 'REVIEW' ? <Target size={24} color="#fff" /> :
                             <PlayCircle size={24} color="#fff" />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Recommended Priority
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                {globalNextAction.topicName}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.95rem', maxWidth: '600px' }}>
                                {globalNextAction.reason}
                            </p>
                        </div>
                    </div>
                    <Link to={globalNextAction.destination} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {globalNextAction.ctaLabel} <ChevronRight size={18} />
                        </button>
                    </Link>
                </motion.div>
            )}

            {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}>Loading your premium roadmap...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444', fontSize: '1.2rem' }}>{error}</div>
                ) : chapters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}>No chapters available.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {chapters.map((chapter, chapIdx) => {
                            const chapterState = getChapterState(chapter);
                            const isChapterLocked = chapterState === 'LOCKED';
                            const topics = chapter.topics || [];
                            
                            return (
                                <div key={normalizeId(chapter._id || chapter.id)} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    
                                    {/* Chapter Header Node */}
                                    <div style={{
                                        background: isChapterLocked ? 'var(--surface)' : 'rgba(37,99,235,0.08)',
                                        border: isChapterLocked ? '2px solid var(--card-border)' : '2px solid var(--primary)',
                                        padding: '1.25rem 2.5rem', borderRadius: '99px',
                                        marginBottom: topics.length > 0 ? '3rem' : '5rem',
                                        zIndex: 2, display: 'flex', alignItems: 'center', gap: '1rem',
                                        boxShadow: isChapterLocked ? 'none' : '0 8px 32px rgba(37,99,235,0.15)',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <span style={{ fontWeight: 800, color: isChapterLocked ? 'var(--text-muted)' : 'var(--primary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {terminology.chapter || 'Chapter'} {chapIdx + 1}
                                        </span>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isChapterLocked ? 'var(--card-border)' : 'var(--primary)' }} />
                                        <span style={{ fontWeight: 800, color: isChapterLocked ? 'var(--text-muted)' : 'var(--text)', fontSize: '1.4rem' }}>
                                            {chapter.chapterName}
                                        </span>
                                    </div>

                                    {/* Topic Nodes */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                        {topics.map((topic, topIdx) => {
                                            const state = getTopicState(topic, chapter);
                                            const config = getTopicStateConfig(state, terminology);
                                            const Icon = config.Icon;
                                            
                                            // Determine layout (zig-zag on desktop)
                                            const isEven = topIdx % 2 === 0;
                                            const offset = isEven ? '-220px' : '220px';
                                            const isLastTopic = topIdx === topics.length - 1;
                                            const isLastChapter = chapIdx === chapters.length - 1;
                                            
                                            return (
                                                <div key={normalizeId(topic._id || topic.id)} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: (isLastTopic && !isLastChapter) ? '6rem' : '4rem' }}>
                                                    
                                                    {/* Vertical connecting line */}
                                                    {!(isLastTopic && isLastChapter) && (
                                                        <div style={{
                                                            position: 'absolute', top: '70px', bottom: isLastTopic ? '-6rem' : '-4rem',
                                                            left: '50%', transform: 'translateX(-50%)',
                                                            width: '4px', background: state === 'PASSED' || state === 'SKIPPED' ? 'var(--primary)' : 'var(--card-border)',
                                                            zIndex: 0, transition: 'background 0.5s ease'
                                                        }} />
                                                    )}

                                                    {/* Desktop Zig-Zag Branch Line */}
                                                    <div className="desktop-branch-line" style={{
                                                        position: 'absolute', top: '34px', left: '50%',
                                                        width: '220px', height: '4px',
                                                        background: state === 'PASSED' || state === 'SKIPPED' ? 'var(--primary)' : 'var(--card-border)',
                                                        transform: isEven ? 'translateX(-100%)' : 'translateX(0)',
                                                        zIndex: 0, transition: 'background 0.5s ease'
                                                    }} />

                                                    {/* The Topic Node */}
                                                    <motion.div 
                                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                        onClick={() => handleTopicClick(topic, chapter)}
                                                        className="topic-node-container"
                                                        style={{
                                                            position: 'relative', zIndex: 2, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center',
                                                            transform: `translateX(${offset})`,
                                                        }}
                                                    >
                                                        {isEven ? (
                                                            <>
                                                                {/* Text side */}
                                                                <div className="topic-text-left glass-card" style={{ 
                                                                    textAlign: 'right', width: '280px', padding: '1.25rem 1.5rem', 
                                                                    borderRadius: '16px', border: `1px solid ${state === 'LOCKED' ? 'transparent' : config.border}`,
                                                                    background: state === 'LOCKED' ? 'var(--surface)' : 'var(--input-bg)',
                                                                    boxShadow: state !== 'LOCKED' && state !== 'NOT_STARTED' ? `0 4px 20px ${config.color}22` : '0 4px 12px rgba(0,0,0,0.05)',
                                                                    marginRight: '1.5rem'
                                                                }}>
                                                                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: state === 'LOCKED' ? 'var(--text-muted)' : 'var(--text)', marginBottom: '0.5rem', lineHeight: '1.3' }}>{topic.topicName || topic.title}</div>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: config.color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', width: '100%' }}>
                                                                        {config.label}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Circle Node */}
                                                                <div className="topic-circle" style={{
                                                                    width: '72px', height: '72px', borderRadius: '50%',
                                                                    background: state === 'PASSED' || state === 'SKIPPED' ? config.color : config.bg,
                                                                    border: `3px solid ${config.border}`,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    color: state === 'PASSED' || state === 'SKIPPED' ? '#fff' : config.color,
                                                                    boxShadow: state !== 'LOCKED' && state !== 'NOT_STARTED' ? `0 0 24px ${config.color}55` : 'none',
                                                                    flexShrink: 0, transition: 'all 0.3s ease'
                                                                }}>
                                                                    <Icon size={32} />
                                                                </div>

                                                                {/* Spacer for symmetry */}
                                                                <div className="desktop-spacer" style={{ width: 'calc(280px + 1.5rem)' }} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Spacer for symmetry */}
                                                                <div className="desktop-spacer" style={{ width: 'calc(280px + 1.5rem)' }} />

                                                                {/* Circle Node */}
                                                                <div className="topic-circle" style={{
                                                                    width: '72px', height: '72px', borderRadius: '50%',
                                                                    background: state === 'PASSED' || state === 'SKIPPED' ? config.color : config.bg,
                                                                    border: `3px solid ${config.border}`,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    color: state === 'PASSED' || state === 'SKIPPED' ? '#fff' : config.color,
                                                                    boxShadow: state !== 'LOCKED' && state !== 'NOT_STARTED' ? `0 0 24px ${config.color}55` : 'none',
                                                                    flexShrink: 0, transition: 'all 0.3s ease'
                                                                }}>
                                                                    <Icon size={32} />
                                                                </div>

                                                                {/* Text side */}
                                                                <div className="topic-text-right glass-card" style={{ 
                                                                    textAlign: 'left', width: '280px', padding: '1.25rem 1.5rem', 
                                                                    borderRadius: '16px', border: `1px solid ${state === 'LOCKED' ? 'transparent' : config.border}`,
                                                                    background: state === 'LOCKED' ? 'var(--surface)' : 'var(--input-bg)',
                                                                    boxShadow: state !== 'LOCKED' && state !== 'NOT_STARTED' ? `0 4px 20px ${config.color}22` : '0 4px 12px rgba(0,0,0,0.05)',
                                                                    marginLeft: '1.5rem'
                                                                }}>
                                                                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: state === 'LOCKED' ? 'var(--text-muted)' : 'var(--text)', marginBottom: '0.5rem', lineHeight: '1.3' }}>{topic.topicName || topic.title}</div>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: config.color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-start', width: '100%' }}>
                                                                        {config.label}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* End of Path Trophy */}
                        {chapters.length > 0 && (
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                border: '4px solid var(--surface)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', zIndex: 2, boxShadow: '0 12px 32px rgba(245,158,11,0.5)',
                                marginTop: '-2rem'
                            }}>
                                <Award size={40} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Topic Details Modal ── */}
            <AnimatePresence>
                {selectedTopic && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '1.5rem'
                    }} onClick={() => setSelectedTopic(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', position: 'relative', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
                        >
                            <button onClick={() => setSelectedTopic(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--surface)', border: '1px solid var(--card-border)', cursor: 'pointer', color: 'var(--text-muted)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                <X size={20} />
                            </button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: selectedTopic.state === 'PASSED' || selectedTopic.state === 'SKIPPED' ? selectedTopic.config.color : selectedTopic.config.bg, border: `3px solid ${selectedTopic.config.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedTopic.state === 'PASSED' || selectedTopic.state === 'SKIPPED' ? '#fff' : selectedTopic.config.color, flexShrink: 0, boxShadow: `0 8px 24px ${selectedTopic.config.color}44` }}>
                                    <selectedTopic.config.Icon size={32} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedTopic.chapter.chapterName}</div>
                                    <h3 style={{ fontSize: '1.5rem', margin: '0.3rem 0', color: 'var(--text)', lineHeight: '1.3' }}>{selectedTopic.topic.topicName || selectedTopic.topic.title}</h3>
                                </div>
                            </div>

                            <div style={{ background: 'var(--input-bg)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--card-border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>Status</span>
                                    <span style={{ fontWeight: 800, color: selectedTopic.config.color, fontSize: '1rem' }}>{selectedTopic.config.label}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>Mastery Level</span>
                                    <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1rem' }}>{selectedTopic.masteryBand !== 'NONE' ? selectedTopic.masteryBand : 'Not Tested'}</span>
                                </div>
                            </div>

                            {selectedTopic.state === 'LOCKED' ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}>
                                    <Lock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.7 }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Locked</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>Complete previous topics to unlock.</div>
                                </div>
                            ) : selectedTopic.ctaAction ? (
                                <Link 
                                    to={selectedTopic.ctaAction.route}
                                    className="btn btn-primary"
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.75rem', padding: '1.1rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '12px' }}
                                >
                                    {getCtaLabel(selectedTopic.ctaAction.type, experience)} <ChevronRight size={22} />
                                </Link>
                            ) : null}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {/* ── CSS for Mobile layout override ── */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 1100px) {
                    .desktop-branch-line, .desktop-spacer { display: none !important; }
                    .topic-node-container { transform: translateX(0) !important; flex-direction: row !important; gap: 1.25rem !important; }
                    .topic-text-left, .topic-text-right { width: calc(100vw - 130px) !important; max-width: 400px !important; text-align: left !important; margin: 0 !important; }
                    .topic-text-left > div:last-child { justify-content: flex-start !important; }
                    .topic-circle { order: 1 !important; }
                    .topic-text-left, .topic-text-right { order: 2 !important; }
                }
            `}} />

            {/* AI Tutor Floating Widget for Skill Tree */}
            <AiTutorWidget 
                contextData={{
                    subjectName: subjects.find(s => normalizeId(s._id || s.id) === selectedSubjectId)?.name || 'Your Curriculum',
                    topicName: 'Learning Roadmap',
                    status: 'in_progress'
                }} 
            />
        </div>
    );
};

export default SkillTreePage;
