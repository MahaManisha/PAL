import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, FileText, CheckSquare, ArrowLeft, ArrowRight,
    Download, Sparkles, CheckCircle, Target, Layers, Grid
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { normalizeId } from '../utils/progressionEngine';
import Section24Content from '../components/Section24Content';
import Section25Content from '../components/Section25Content';
import Section26Content from '../components/Section26Content';
import Section27Content from '../components/Section27Content';
import Section28Content from '../components/Section28Content';

const MainContentViewer = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useContext(AuthContext);
    const { themeConfig } = useTheme();

    const [chapter, setChapter] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    const availableSections = ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8'];

    // Selected Section: '2.1' through '2.8'
    const querySection = searchParams.get('section');
    const [selectedSection, setSelectedSection] = useState(
        querySection && availableSections.includes(querySection) ? querySection : '2.1'
    );
    // Active main content module tab: 'content' | 'example' | 'exercise'
    const [activeTab, setActiveTab] = useState('content');

    const terminology = themeConfig?.terminology || { chapter: 'Chapter', topic: 'Topic', assessment: 'Assessment' };

    useEffect(() => {
        if (querySection && availableSections.includes(querySection) && querySection !== selectedSection) {
            setSelectedSection(querySection);
        }
    }, [querySection]);

    useEffect(() => {
        const fetchChapter = async () => {
            if (!chapterId) return;
            setLoading(true);
            try {
                // Fetch chapter details & topics
                const topicsRes = await apiClient.get(`/api/topics/${normalizeId(chapterId)}`).catch(() => ({ data: [] }));
                const topicList = Array.isArray(topicsRes.data) ? [...topicsRes.data] : [];
                setTopics(topicList);

                if (topicList.length > 0) {
                    const detailRes = await apiClient.get(`/api/topics/detail/${topicList[0]._id || topicList[0].id}`).catch(() => null);
                    if (detailRes?.data?.chapterId) {
                        setChapter(detailRes.data.chapterId);
                    }
                }
            } catch (err) {
                console.error('MainContentViewer: Error fetching chapter data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChapter();
    }, [chapterId]);

    const chapterName = chapter?.chapterName || `${terminology.chapter} 2: Complex Numbers`;
    const subjectName = chapter?.subjectId?.name || 'Mathematics';

    // Build PDF paths with graceful fallback to 2.1 files if section PDF not uploaded yet
    const contentFilename = selectedSection === '2.7' ? '2.7_content_Eng.pdf' : `${selectedSection}_Content_Eng.pdf`;
    const pdfPaths = {
        content: `/videos/Mathematics/Chapter%202/Main%20Content/${selectedSection}/${contentFilename}`,
        example: `/videos/Mathematics/Chapter%202/Main%20Content/${selectedSection}/${selectedSection}_Example_Eng.pdf`,
        exercise: `/videos/Mathematics/Chapter%202/Main%20Content/${selectedSection}/${selectedSection}_Exercise_Eng.pdf`
    };

    // Fallback URL to 2.1 if selectedSection is not 2.1 (since 2.1 is available on disk)
    const fallbackPdfPaths = {
        content: `/videos/Mathematics/Chapter%202/Main%20Content/2.1/2.1_Content_Eng.pdf`,
        example: `/videos/Mathematics/Chapter%202/Main%20Content/2.1/2.1_Example_Eng.pdf`,
        exercise: `/videos/Mathematics/Chapter%202/Main%20Content/2.1/2.1_Exercise_Eng.pdf`
    };

    const activePdfUrl = availableSections.includes(selectedSection)
        ? (selectedSection === '2.3' && activeTab === 'example' ? pdfPaths['content'] : pdfPaths[activeTab])
        : fallbackPdfPaths[activeTab];
    const pdfEmbedSrc = activePdfUrl ? `${activePdfUrl}#view=FitH&toolbar=0` : '';

    const handleNextStep = () => {
        if (selectedSection === '2.3') {
            if (activeTab === 'content') {
                setActiveTab('exercise');
            } else if (activeTab === 'exercise') {
                setSelectedSection('2.4');
                setActiveTab('content');
            }
            return;
        }
        if (activeTab === 'content') {
            setActiveTab('example');
        } else if (activeTab === 'example') {
            setActiveTab('exercise');
        } else if (activeTab === 'exercise') {
            const currIdx = availableSections.indexOf(selectedSection);
            if (currIdx !== -1 && currIdx + 1 < availableSections.length) {
                setSelectedSection(availableSections[currIdx + 1]);
                setActiveTab('content');
            } else {
                navigate(`/chapter/${chapterId}/final-assessment`);
            }
        }
    };

    const handlePrevStep = () => {
        if (selectedSection === '2.3') {
            if (activeTab === 'exercise') {
                setActiveTab('content');
            } else if (activeTab === 'content') {
                setSelectedSection('2.2');
                setActiveTab('exercise');
            }
            return;
        }
        if (activeTab === 'exercise') {
            setActiveTab('example');
        } else if (activeTab === 'example') {
            setActiveTab('content');
        } else if (activeTab === 'content') {
            const currIdx = availableSections.indexOf(selectedSection);
            if (currIdx > 0) {
                setSelectedSection(availableSections[currIdx - 1]);
                setActiveTab('exercise');
            }
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                    <BookOpen size={40} className="micro-sparkle" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Elaborated Main Content...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '4rem', width: '100%', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '4rem' }}>
            
            {/* Top Navigation & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                    onClick={() => navigate(`/chapter/${chapterId}/microcontent-complete`)}
                    className="btn btn-secondary"
                    style={{ gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text)' }}
                >
                    <ArrowLeft size={16} /> Back to Milestone
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                        Elaborated Main Content &bull; Section {selectedSection}
                    </div>
                    <h2 className="heading-gradient" style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>
                        {chapterName}
                    </h2>
                </div>

                <div style={{
                    padding: '0.4rem 1rem', borderRadius: '999px',
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    display: 'inline-flex', alignItems: 'center', gap: '0.45rem'
                }}>
                    <Layers size={15} /> Main Chapter Module
                </div>
            </div>

            {/* Section Switcher Pills (2.1 | 2.2 | 2.3 | 2.4 | 2.5) */}
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem',
                marginBottom: '1.75rem', flexWrap: 'wrap'
            }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Section:
                </span>
                {availableSections.map((sec) => (
                    <button
                        key={sec}
                        onClick={() => {
                            setSelectedSection(sec);
                            setActiveTab('content');
                            setSearchParams({ section: sec });
                        }}
                        style={{
                            padding: '0.45rem 1.1rem', borderRadius: '999px',
                            border: selectedSection === sec ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                            background: selectedSection === sec ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
                            color: selectedSection === sec ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: selectedSection === sec ? 800 : 600,
                            fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                    >
                        Section {sec}
                    </button>
                ))}
            </div>

            {/* Stepper Bar (Adaptive: 2 tabs for Section 2.3, 3 tabs for other sections) */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                {/* Step 1: Content */}
                <button
                    onClick={() => setActiveTab('content')}
                    style={{
                        padding: '0.85rem 1.75rem', borderRadius: '0.85rem',
                        border: activeTab === 'content' ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                        background: activeTab === 'content' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'content' ? '#ffffff' : 'var(--text)',
                        fontWeight: 700, fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: activeTab === 'content' ? '0 4px 15px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                >
                    <BookOpen size={18} />
                    1. Content (Theory)
                </button>

                {/* Step 2: Worked Examples (for sections that have dedicated example file) */}
                {selectedSection !== '2.3' && (
                    <button
                        onClick={() => setActiveTab('example')}
                        style={{
                            padding: '0.85rem 1.75rem', borderRadius: '0.85rem',
                            border: activeTab === 'example' ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                            background: activeTab === 'example' ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === 'example' ? '#ffffff' : 'var(--text)',
                            fontWeight: 700, fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            boxShadow: activeTab === 'example' ? '0 4px 15px rgba(99, 102, 241, 0.35)' : 'none'
                        }}
                    >
                        <FileText size={18} />
                        2. Worked Examples
                    </button>
                )}

                {/* Step 3 (or 2 for 2.3): Exercise */}
                <button
                    onClick={() => setActiveTab('exercise')}
                    style={{
                        padding: '0.85rem 1.75rem', borderRadius: '0.85rem',
                        border: activeTab === 'exercise' ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                        background: activeTab === 'exercise' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'exercise' ? '#ffffff' : 'var(--text)',
                        fontWeight: 700, fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: activeTab === 'exercise' ? '0 4px 15px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                >
                    <CheckSquare size={18} />
                    {selectedSection === '2.3' ? '2. Exercise Problems' : '3. Exercise Problems'}
                </button>
            </div>

            {/* Viewer Stage & PDF Container */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedSection}-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="glass-card"
                    style={{
                        padding: ['2.4', '2.5', '2.6', '2.7', '2.8'].includes(selectedSection) ? '0' : '1rem',
                        borderRadius: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '84vh',
                        background: 'var(--surface)',
                        border: '1px solid var(--card-border)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}
                >
                    {selectedSection === '2.4' ? (
                        <Section24Content activeModule={activeTab} onModuleChange={setActiveTab} />
                    ) : selectedSection === '2.5' ? (
                        <Section25Content activeModule={activeTab} onModuleChange={setActiveTab} />
                    ) : selectedSection === '2.6' ? (
                        <Section26Content activeModule={activeTab} onModuleChange={setActiveTab} />
                    ) : selectedSection === '2.7' ? (
                        <Section27Content activeModule={activeTab} onModuleChange={setActiveTab} />
                    ) : selectedSection === '2.8' ? (
                        <Section28Content activeModule={activeTab} onModuleChange={setActiveTab} />
                    ) : (
                        <>
                            {/* Inner Header Label & Download Option */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.6rem 1rem 0.8rem 1rem', borderBottom: '1px solid var(--card-border)',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    {activeTab === 'content' && <BookOpen size={20} color="var(--primary)" />}
                                    {activeTab === 'example' && <FileText size={20} color="#f59e0b" />}
                                    {activeTab === 'exercise' && <CheckSquare size={20} color="#22c55e" />}
                                    
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                                        {activeTab === 'content' && `Section ${selectedSection} Content — Main Theory & Concepts`}
                                        {activeTab === 'example' && `Section ${selectedSection} Worked Examples — Step-by-Step Solutions`}
                                        {activeTab === 'exercise' && `Section ${selectedSection} Exercise — Practice Problem Sets`}
                                    </h3>
                                </div>

                                <a
                                    href={activePdfUrl}
                                    download
                                    className="btn"
                                    style={{
                                        padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
                                        background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                                        color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                                    }}
                                >
                                    <Download size={14} /> Download PDF
                                </a>
                            </div>

                            {/* PDF Frame Embed */}
                            <div style={{ flex: 1, background: '#1e293b', borderRadius: '0.75rem', overflow: 'hidden' }}>
                                <iframe
                                    src={pdfEmbedSrc}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none', display: 'block' }}
                                    title={`Section ${selectedSection} ${activeTab} Viewer`}
                                />
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Bottom Controls / Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                    onClick={handlePrevStep}
                    disabled={activeTab === 'content' && selectedSection === '2.1'}
                    className="btn"
                    style={{
                        padding: '0.85rem 1.5rem', fontWeight: 600,
                        background: (activeTab === 'content' && selectedSection === '2.1') ? 'transparent' : 'var(--surface)',
                        border: '1px solid var(--card-border)',
                        color: (activeTab === 'content' && selectedSection === '2.1') ? 'var(--text-muted)' : 'var(--text)',
                        opacity: (activeTab === 'content' && selectedSection === '2.1') ? 0.4 : 1,
                        cursor: (activeTab === 'content' && selectedSection === '2.1') ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <ArrowLeft size={16} />
                    {activeTab === 'exercise' && (selectedSection === '2.3' ? `Back to ${selectedSection} Content` : `Back to ${selectedSection} Examples`)}
                    {activeTab === 'example' && `Back to ${selectedSection} Content`}
                    {activeTab === 'content' && selectedSection !== '2.1' && `Back to Section ${availableSections[availableSections.indexOf(selectedSection) - 1]} Exercise`}
                </button>

                <button
                    onClick={handleNextStep}
                    className="btn btn-primary"
                    style={{
                        padding: '0.9rem 2rem', fontWeight: 700, fontSize: '1rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        background: activeTab === 'exercise' && selectedSection === '2.8'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        boxShadow: activeTab === 'exercise' && selectedSection === '2.8'
                            ? '0 6px 20px rgba(16, 185, 129, 0.35)'
                            : '0 6px 20px rgba(37, 99, 235, 0.35)',
                        borderRadius: '0.85rem'
                    }}
                >
                    {activeTab === 'content' && (selectedSection === '2.3' ? <>Proceed to {selectedSection} Exercise <ArrowRight size={18} /></> : <>Proceed to {selectedSection} Examples <ArrowRight size={18} /></>)}
                    {activeTab === 'example' && <>Proceed to {selectedSection} Exercise <ArrowRight size={18} /></>}
                    {activeTab === 'exercise' && selectedSection !== '2.8' && <>Proceed to Section {availableSections[availableSections.indexOf(selectedSection) + 1]} Content <ArrowRight size={18} /></>}
                    {activeTab === 'exercise' && selectedSection === '2.8' && <>Complete Main Content & Take Final Assessment <Target size={18} /></>}
                </button>
            </div>

        </div>
    );
};

export default MainContentViewer;

