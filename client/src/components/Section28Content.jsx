import React, { useState } from 'react';
import {
    BookOpen, FileText, CheckSquare, Layers, Download, CheckCircle,
    Info, Eye, ChevronRight, HelpCircle, ArrowRight, Zap, Sparkles
} from 'lucide-react';

const Section28Content = ({ activeModule = 'content', onModuleChange }) => {
    const [viewMode, setViewMode] = useState('interactive');
    const [selectedModule, setSelectedModule] = useState(activeModule);

    React.useEffect(() => {
        if (activeModule && ['content', 'example', 'exercise', 'all'].includes(activeModule)) {
            setSelectedModule(activeModule);
        }
    }, [activeModule]);

    const handleSelectTab = (tab) => {
        setSelectedModule(tab);
        if (onModuleChange && tab !== 'all') {
            onModuleChange(tab);
        }
    };

    const pdfMap = {
        content: '/videos/Mathematics/Chapter%202/Main%20Content/2.8/2.8_Content_Eng.pdf',
        example: '/videos/Mathematics/Chapter%202/Main%20Content/2.8/2.8_Example_Eng.pdf',
        exercise: '/videos/Mathematics/Chapter%202/Main%20Content/2.8/2.8_Exercise_Eng.pdf',
        all: '/videos/Mathematics/Chapter%202/Main%20Content/2.8/2.8_Content_Eng.pdf'
    };

    const currentPdfUrl = pdfMap[selectedModule] || pdfMap.content;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
            
            {/* Control Bar: Module Switcher & View Mode Toggle */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--card-border)',
                background: 'rgba(255,255,255,0.02)', flexWrap: 'wrap', gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginRight: '0.3rem' }}>
                        Resource:
                    </span>
                    <button
                        onClick={() => handleSelectTab('content')}
                        style={{
                            padding: '0.35rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.82rem', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s ease',
                            border: selectedModule === 'content' ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                            background: selectedModule === 'content' ? 'var(--primary)' : 'var(--surface)',
                            color: selectedModule === 'content' ? '#fff' : 'var(--text)'
                        }}
                    >
                        1. De Moivre's Theorem & Roots of Unity
                    </button>
                    <button
                        onClick={() => handleSelectTab('example')}
                        style={{
                            padding: '0.35rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.82rem', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s ease',
                            border: selectedModule === 'example' ? '1.5px solid #f59e0b' : '1px solid var(--card-border)',
                            background: selectedModule === 'example' ? '#f59e0b' : 'var(--surface)',
                            color: selectedModule === 'example' ? '#fff' : 'var(--text)'
                        }}
                    >
                        2. Worked Examples (2.28 - 2.36)
                    </button>
                    <button
                        onClick={() => handleSelectTab('exercise')}
                        style={{
                            padding: '0.35rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.82rem', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s ease',
                            border: selectedModule === 'exercise' ? '1.5px solid #10b981' : '1px solid var(--card-border)',
                            background: selectedModule === 'exercise' ? '#10b981' : 'var(--surface)',
                            color: selectedModule === 'exercise' ? '#fff' : 'var(--text)'
                        }}
                    >
                        3. Exercise 2.8 Solutions (Q1 - Q9)
                    </button>
                    <button
                        onClick={() => handleSelectTab('all')}
                        style={{
                            padding: '0.35rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.82rem', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s ease',
                            border: selectedModule === 'all' ? '1.5px solid #8b5cf6' : '1px solid var(--card-border)',
                            background: selectedModule === 'all' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--surface)',
                            color: selectedModule === 'all' ? '#fff' : 'var(--text)'
                        }}
                    >
                        <Layers size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        Complete Lesson (All 3 Combined)
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        display: 'inline-flex', background: 'var(--input-bg)', padding: '2px',
                        borderRadius: '0.5rem', border: '1px solid var(--card-border)'
                    }}>
                        <button
                            onClick={() => setViewMode('interactive')}
                            style={{
                                padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none',
                                background: viewMode === 'interactive' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'interactive' ? '#fff' : 'var(--text-muted)',
                                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
                            }}
                        >
                            <BookOpen size={14} /> Interactive Lesson View
                        </button>
                        <button
                            onClick={() => setViewMode('pdf')}
                            style={{
                                padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none',
                                background: viewMode === 'pdf' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'pdf' ? '#fff' : 'var(--text-muted)',
                                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
                            }}
                        >
                            <FileText size={14} /> PDF Slides Embed
                        </button>
                    </div>

                    <a
                        href={currentPdfUrl}
                        download
                        className="btn"
                        style={{
                            padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600,
                            background: 'var(--surface)', border: '1px solid var(--card-border)',
                            color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                        }}
                    >
                        <Download size={13} /> PDF
                    </a>
                </div>
            </div>

            {/* Main Content View */}
            <div style={{ flex: 1, overflowY: 'auto', padding: viewMode === 'pdf' ? '0' : '1.5rem 1.75rem' }}>
                {viewMode === 'pdf' ? (
                    <div style={{ width: '100%', height: '100%', background: '#1e293b' }}>
                        <iframe
                            src={`${currentPdfUrl}#view=FitH&toolbar=0`}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            style={{ border: 'none', display: 'block', minHeight: '650px' }}
                            title="Section 2.8 PDF Viewer"
                        />
                    </div>
                ) : (
                    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Header Banner */}
                        <div style={{
                            padding: '1.25rem 1.5rem', borderRadius: '1rem',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                                    Standard Higher Secondary Mathematics &bull; Chapter 2: Complex Numbers
                                </div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text)' }}>
                                    2.8 De Moivre's Theorem and its Applications
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    De Moivre's Theorem Statement, Corollaries 1–4, n-th Roots of Complex Numbers, Properties &amp; Geometry of Roots of Unity, Examples 2.28–2.36, and Exercise 2.8 Solutions.
                                </p>
                            </div>
                            <div style={{
                                padding: '0.4rem 0.9rem', borderRadius: '999px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)'
                            }}>
                                Section 2.8 Complete Content
                            </div>
                        </div>

                        {/* PART 1: THEORY */}
                        {(selectedModule === 'content' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
                                    <Zap size={22} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 1: Theory, De Moivre's Theorem &amp; n-th Roots of Unity (2.8_Content_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Historical Note & Theorem */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        THEOREM STATEMENT &bull; PAGE 87
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        De Moivre's Theorem
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        Abraham De Moivre (1667–1754) established the seminal link between complex numbers and trigonometry. The theorem states:
                                        <br />
                                        Given any real number &theta; and any integer n &isin; &integers;:
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.6rem', borderLeft: '4px solid var(--primary)', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                                        (cos &theta; + i sin &theta;)ⁿ = cos n&theta; + i sin n&theta;
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text)', margin: 0 }}>
                                        In exponential notation: <strong>(e^(i&theta;))ⁿ = e^(i n&theta;)</strong>.
                                    </p>
                                </div>

                                {/* Corollaries */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        Four Corollaries of De Moivre's Theorem
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', marginTop: '0.5rem' }}>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>Corollary 1 (Positive Integer)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>(cos &theta; + i sin &theta;)ⁿ = cos n&theta; + i sin n&theta;</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>Corollary 2 (Negative Integer)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>(cos &theta; + i sin &theta;)⁻ⁿ = cos n&theta; - i sin n&theta;</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>Corollary 3 (Conjugate Positive)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>(cos &theta; - i sin &theta;)ⁿ = cos n&theta; - i sin n&theta;</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>Corollary 4 (Conjugate Negative)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>(cos &theta; - i sin &theta;)⁻ⁿ = cos n&theta; + i sin n&theta;</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Finding n-th roots */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        SECTION 2.8.2 &bull; PAGE 89
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Finding the n-th Roots of a Complex Number
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        Any non-zero complex number z = r(cos &theta; + i sin &theta;) has exactly <strong>n distinct n-th roots</strong> in &complexes;, obtained by adding 2k&pi; to the argument and dividing by n:
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.6rem', borderLeft: '4px solid var(--primary)', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                                        z^(1/n) = r^(1/n) [ cos((&theta; + 2k&pi;)/n) + i sin((&theta; + 2k&pi;)/n) ], &nbsp; where k = 0, 1, 2, ..., n - 1
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text)', margin: 0 }}>
                                        Each value of k &isin; {'{'}0, 1, ..., n - 1{'}'} produces a unique root. Values of k &ge; n simply repeat previous roots periodically.
                                    </p>
                                </div>

                                {/* Roots of Unity */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        SECTION 2.8.3 &bull; PAGE 90
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        n-th Roots of Unity &amp; Their Fundamental Properties
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.75rem 0' }}>
                                        The solutions to <strong>zⁿ = 1</strong> are called the n-th roots of unity, given by <strong>&omega;_k = e^(i 2k&pi;/n) = &omega;^k</strong> for k = 0, 1, ..., n - 1 (where &omega; = e^(i 2&pi;/n)):
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.8' }}>
                                        <li><strong>Geometric Placement:</strong> All n roots lie on the unit circle |z| = 1 and form the vertices of a regular polygon of n sides centered at the origin.</li>
                                        <li><strong>Geometric Progression:</strong> The roots form a geometric progression with common ratio &omega;: <strong>1, &omega;, &omega;², ..., &omega;^(n-1)</strong>.</li>
                                        <li><strong>Sum of Roots = 0:</strong> 1 + &omega; + &omega;² + ··· + &omega;^(n-1) = 0.</li>
                                        <li><strong>Product of Roots:</strong> 1 &times; &omega; &times; &omega;² &times; ··· &times; &omega;^(n-1) = <strong>(-1)^(n-1)</strong>.</li>
                                        <li><strong>Cube Roots of Unity (n = 3):</strong> 1, &omega; = -1/2 + i&radic;3/2, &omega;² = -1/2 - i&radic;3/2, with 1 + &omega; + &omega;² = 0 and &omega;³ = 1.</li>
                                        <li><strong>Fourth Roots of Unity (n = 4):</strong> 1, i, -1, -i (i.e. &plusmn;1, &plusmn;i).</li>
                                    </ul>
                                </div>
                            </section>
                        )}

                        {/* PART 2: WORKED EXAMPLES */}
                        {(selectedModule === 'example' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem' }}>
                                    <CheckSquare size={22} color="#f59e0b" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 2: Worked Examples 2.28 to 2.36 (2.8_Example_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Example 2.28 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.28 &bull; PAGE 90
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If z = cos &theta; + i sin &theta;, show that zⁿ + 1/zⁿ = 2 cos n&theta; and zⁿ - 1/zⁿ = 2i sin n&theta;.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            zⁿ = (cos &theta; + i sin &theta;)ⁿ = cos n&theta; + i sin n&theta;.<br />
                                            1/zⁿ = z⁻ⁿ = (cos &theta; + i sin &theta;)⁻ⁿ = cos n&theta; - i sin n&theta;.<br />
                                            Sum: zⁿ + 1/zⁿ = (cos n&theta; + i sin n&theta;) + (cos n&theta; - i sin n&theta;) = <strong>2 cos n&theta;</strong>.<br />
                                            Difference: zⁿ - 1/zⁿ = (cos n&theta; + i sin n&theta;) - (cos n&theta; - i sin n&theta;) = <strong>2i sin n&theta;</strong>. Q.E.D.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.29 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.29 &bull; PAGE 91
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Simplify (sin &pi;/6 + i cos &pi;/6)¹⁸.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Note that cosine is the imaginary coefficient. Factor out i:</p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            sin &pi;/6 + i cos &pi;/6 = i(cos &pi;/6 - i sin &pi;/6)<br />
                                            [i(cos &pi;/6 - i sin &pi;/6)]¹⁸ = i¹⁸ [cos(18&pi;/6) - i sin(18&pi;/6)]<br />
                                            = (i²)⁹ [cos 3&pi; - i sin 3&pi;] = (-1)⁹ [-1 - i(0)] = (-1)(-1) = <strong>1</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.30 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.30 &bull; PAGE 91
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Simplify [(1 + cos 2&theta; + i sin 2&theta;) / (1 + cos 2&theta; - i sin 2&theta;)]³⁰.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            Let z = cos 2&theta; + i sin 2&theta; &rArr; 1/z = cos 2&theta; - i sin 2&theta;.<br />
                                            Expression = [(1 + z) / (1 + 1/z)]³⁰ = [(1 + z) / ((z + 1)/z)]³⁰ = z³⁰<br />
                                            = (cos 2&theta; + i sin 2&theta;)³⁰ = <strong>cos 60&theta; + i sin 60&theta;</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.31 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.31 &bull; PAGE 91
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Simplify: (i) (1 + i)¹⁸, (ii) (-&radic;3 + 3i)³¹.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}><strong>(i) (1 + i)¹⁸:</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0 0 0.5rem 0' }}>
                                            1 + i = &radic;2(cos &pi;/4 + i sin &pi;/4)<br />
                                            (1 + i)¹⁸ = (&radic;2)¹⁸ (cos 18&pi;/4 + i sin 18&pi;/4) = 2⁹ (cos 9&pi;/2 + i sin 9&pi;/2)<br />
                                            = 512 [cos(&pi;/2) + i sin(&pi;/2)] = 512(0 + i) = <strong>512i</strong>.
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0.3rem 0' }}><strong>(ii) (-&radic;3 + 3i)³¹:</strong></p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            r = &radic;(3 + 9) = &radic;12 = 2&radic;3. &alpha; = tan⁻¹(3/&radic;3) = &pi;/3 &rArr; &theta; = &pi; - &pi;/3 = 2&pi;/3.<br />
                                            (-&radic;3 + 3i)³¹ = (2&radic;3)³¹ [cos(62&pi;/3) + i sin(62&pi;/3)]<br />
                                            = (2&radic;3)³¹ [cos(20&pi; + 2&pi;/3) + i sin(20&pi; + 2&pi;/3)] = <strong>(2&radic;3)³¹ [-1/2 + i&radic;3/2]</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.32 & 2.33 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLES 2.32 &amp; 2.33 &bull; PAGE 92
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the cube roots and fourth roots of unity.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}><strong>Cube Roots of Unity (z³ = 1):</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0 0 0.6rem 0' }}>
                                            z = cos(2k&pi;/3) + i sin(2k&pi;/3), k = 0, 1, 2.<br />
                                            k = 0 &rArr; 1.<br />
                                            k = 1 &rArr; cos(2&pi;/3) + i sin(2&pi;/3) = -1/2 + i&radic;3/2 = <strong>&omega;</strong>.<br />
                                            k = 2 &rArr; cos(4&pi;/3) + i sin(4&pi;/3) = -1/2 - i&radic;3/2 = <strong>&omega;²</strong>.
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0.3rem 0' }}><strong>Fourth Roots of Unity (z⁴ = 1):</strong></p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            z = cos(k&pi;/2) + i sin(k&pi;/2), k = 0, 1, 2, 3 &rArr; <strong>1, i, -1, -i</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.34 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.34 &bull; PAGE 93
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Solve z³ + 8i = 0, where z &isin; &complexes;.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            z³ = -8i = 8(0 - i) = 8[cos(-&pi;/2) + i sin(-&pi;/2)]<br />
                                            z = 8^(1/3) [cos((-&pi;/2 + 2k&pi;)/3) + i sin((-&pi;/2 + 2k&pi;)/3)]<br />
                                            = 2 [cos((4k - 1)&pi;/6) + i sin((4k - 1)&pi;/6)], k = 0, 1, 2.<br />
                                            k = 0 &rArr; 2[cos(-&pi;/6) + i sin(-&pi;/6)] = 2(&radic;3/2 - i/2) = <strong>&radic;3 - i</strong>.<br />
                                            k = 1 &rArr; 2[cos(3&pi;/6) + i sin(3&pi;/6)] = 2(0 + i) = <strong>2i</strong>.<br />
                                            k = 2 &rArr; 2[cos(7&pi;/6) + i sin(7&pi;/6)] = 2(-&radic;3/2 - i/2) = <strong>-&radic;3 - i</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.35 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.35 &bull; PAGE 93
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find all cube roots of &radic;3 + i.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            &radic;3 + i = 2(cos &pi;/6 + i sin &pi;/6)<br />
                                            z = 2^(1/3) [cos((&pi;/6 + 2k&pi;)/3) + i sin((&pi;/6 + 2k&pi;)/3)]<br />
                                            = <strong>2^(1/3) [cos((12k + 1)&pi;/18) + i sin((12k + 1)&pi;/18)], k = 0, 1, 2</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.36 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.36 &bull; PAGE 94
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Suppose z₁, z₂, z₃ are the vertices of an equilateral triangle inscribed in the circle |z| = 2. If z₁ = 1 + i&radic;3, find z₂ and z₃.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>z₁ = 1 + i&radic;3 = 2(cos &pi;/3 + i sin &pi;/3). The vertices of an equilateral triangle are separated by 2&pi;/3 radians (multiplication by &omega; and &omega;²):</p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            z₂ = z₁ &times; e^(i2&pi;/3) = 2[cos(&pi;/3 + 2&pi;/3) + i sin(&pi;/3 + 2&pi;/3)] = 2(cos &pi; + i sin &pi;) = <strong>-2</strong>.<br />
                                            z₃ = z₁ &times; e^(i4&pi;/3) = 2[cos(&pi;/3 + 4&pi;/3) + i sin(&pi;/3 + 4&pi;/3)] = 2[cos(5&pi;/3) + i sin(5&pi;/3)]<br />
                                            = 2(1/2 - i&radic;3/2) = <strong>1 - i&radic;3</strong>.
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* PART 3: EXERCISE SOLUTIONS */}
                        {(selectedModule === 'exercise' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #10b981', paddingBottom: '0.5rem' }}>
                                    <Sparkles size={22} color="#10b981" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 3: Exercise 2.8 Full Solutions (2.8_Exercise_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Q1 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 1
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If &omega; &ne; 1 is a cube root of unity, show that (a + b&omega; + c&omega;²)/(b + c&omega; + a&omega;²) + (a + b&omega; + c&omega;²)/(c + a&omega; + b&omega;²) = -1.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            First term: Multiply numerator by &omega;:<br />
                                            &omega;(a + b&omega; + c&omega;²) = a&omega; + b&omega;² + c&omega;³ = c + a&omega; + b&omega;².<br />
                                            (a + b&omega; + c&omega;²)/(b + c&omega; + a&omega;²) = &omega;².<br />
                                            Second term: (a + b&omega; + c&omega;²)/(c + a&omega; + b&omega;²) = &omega;.<br />
                                            Sum = &omega;² + &omega; = -1 &nbsp; (since 1 + &omega; + &omega;² = 0). Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q2 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 2
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Show that (&radic;3/2 + i/2)⁵ + (&radic;3/2 - i/2)⁵ = -&radic;3.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            &radic;3/2 + i/2 = cos &pi;/6 + i sin &pi;/6.<br />
                                            (&radic;3/2 + i/2)⁵ = cos 5&pi;/6 + i sin 5&pi;/6.<br />
                                            (&radic;3/2 - i/2)⁵ = cos 5&pi;/6 - i sin 5&pi;/6.<br />
                                            Sum = 2 cos(5&pi;/6) = 2(-&radic;3/2) = <strong>-&radic;3</strong>. Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q3 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 3
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the value of [(1 + sin &pi;/10 + i cos &pi;/10) / (1 + sin &pi;/10 - i cos &pi;/10)]¹⁰.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            Let z = sin &pi;/10 + i cos &pi;/10. Then 1/z = sin &pi;/10 - i cos &pi;/10.<br />
                                            Expression = [(1 + z) / (1 + 1/z)]¹⁰ = z¹⁰ = [i(cos &pi;/10 - i sin &pi;/10)]¹⁰<br />
                                            = i¹⁰ [cos(10&pi;/10) - i sin(10&pi;/10)] = (-1) [cos &pi; - i sin &pi;] = (-1)(-1) = <strong>1</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Q4 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 4
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If 2 cos &alpha; = x + 1/x and 2 cos &beta; = y + 1/y, prove the 4 standard identities:
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Here x = cos &alpha; + i sin &alpha; and y = cos &beta; + i sin &beta;.</p>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                            <li><strong>(i) x/y + y/x:</strong> x/y = cis(&alpha; - &beta;) &rArr; x/y + y/x = <strong>2 cos(&alpha; - &beta;)</strong>.</li>
                                            <li><strong>(ii) xy - 1/(xy):</strong> xy = cis(&alpha; + &beta;) &rArr; xy - 1/(xy) = <strong>2i sin(&alpha; + &beta;)</strong>.</li>
                                            <li><strong>(iii) xᵐ/yⁿ - yⁿ/xᵐ:</strong> xᵐ/yⁿ = cis(m&alpha; - n&beta;) &rArr; difference = <strong>2i sin(m&alpha; - n&beta;)</strong>.</li>
                                            <li><strong>(iv) xᵐyⁿ + 1/(xᵐyⁿ):</strong> xᵐyⁿ = cis(m&alpha; + n&beta;) &rArr; sum = <strong>2 cos(m&alpha; + n&beta;)</strong>.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Q5 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 5
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Solve the equation z³ + 27 = 0.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            z³ = -27 = 27(cos &pi; + i sin &pi;)<br />
                                            z = 3 [cos((&pi; + 2k&pi;)/3) + i sin((&pi; + 2k&pi;)/3)], k = 0, 1, 2.<br />
                                            k = 0 &rArr; 3(cos &pi;/3 + i sin &pi;/3) = <strong>3/2 + i(3&radic;3/2)</strong>.<br />
                                            k = 1 &rArr; 3(cos &pi; + i sin &pi;) = <strong>-3</strong>.<br />
                                            k = 2 &rArr; 3(cos 5&pi;/3 + i sin 5&pi;/3) = <strong>3/2 - i(3&radic;3/2)</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Q6 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 6
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If &omega; &ne; 1 is a cube root of unity, show that the roots of (z - 1)³ + 8 = 0 are -1, 1 - 2&omega;, 1 - 2&omega;².
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            (z - 1)³ = -8 = (-2)³ &times; 1<br />
                                            (z - 1) / (-2) = 1^(1/3) = 1, &omega;, &omega;².<br />
                                            Root 1: z - 1 = -2(1) &rArr; <strong>z = -1</strong>.<br />
                                            Root 2: z - 1 = -2&omega; &rArr; <strong>z = 1 - 2&omega;</strong>.<br />
                                            Root 3: z - 1 = -2&omega;² &rArr; <strong>z = 1 - 2&omega;²</strong>. Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q7 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 7
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the value of &Sigma;ₖ₌₁⁸ (cos 2k&pi;/9 + i sin 2k&pi;/9).
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            The 9 roots of unity are e^(i 2k&pi;/9) for k = 0, 1, ..., 8.<br />
                                            Sum of all 9 roots = &Sigma;ₖ₌₀⁸ e^(i 2k&pi;/9) = 0.<br />
                                            For k = 0: e^0 = 1.<br />
                                            1 + &Sigma;ₖ₌₁⁸ (cos 2k&pi;/9 + i sin 2k&pi;/9) = 0 &rArr; <strong>&Sigma;ₖ₌₁⁸ = -1</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Q8 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 8
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If &omega; &ne; 1 is a cube root of unity, show that: (i) (1 - &omega; + &omega;²)⁶ + (1 + &omega; - &omega;²)⁶ = 128, (ii) (1 + &omega;)(1 + &omega;²)(1 + &omega;⁴)(1 + &omega;⁸)···(1 + &omega;^(2¹¹)) = 1.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            (i) 1 + &omega;² = -&omega; &rArr; 1 - &omega; + &omega;² = -2&omega;.<br />
                                            1 + &omega; = -&omega;² &rArr; 1 + &omega; - &omega;² = -2&omega;².<br />
                                            (-2&omega;)⁶ + (-2&omega;²)⁶ = 64(&omega;⁶) + 64(&omega;¹²) = 64(1) + 64(1) = <strong>128</strong>. Proved.<br /><br />
                                            (ii) (1 + &omega;)(1 + &omega;²) = (-&omega;²)(-&omega;) = &omega;³ = 1.<br />
                                            Since &omega;⁴ = &omega; and &omega;⁸ = &omega;², the 12 factors pair into 6 consecutive pairs each equaling 1.<br />
                                            Product = 1⁶ = <strong>1</strong>. Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q9 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.8 &bull; QUESTION 9
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If z = 2 - 2i, find the rotation of z by &theta; radians in the counter-clockwise direction about origin when: (i) &theta; = &pi;/3, (ii) &theta; = 2&pi;/3, (iii) &theta; = 3&pi;/2.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Counter-clockwise rotation of z by &theta; is given by z' = z &times; e^(i&theta;):</p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            z = 2 - 2i = 2&radic;2 [cos(-&pi;/4) + i sin(-&pi;/4)]<br />
                                            (i) &theta; = &pi;/3: z' = 2&radic;2 [cos(-&pi;/4 + &pi;/3) + i sin(-&pi;/4 + &pi;/3)] = <strong>2&radic;2 [cos(&pi;/12) + i sin(&pi;/12)]</strong>.<br />
                                            (ii) &theta; = 2&pi;/3: z' = 2&radic;2 [cos(-&pi;/4 + 2&pi;/3) + i sin(-&pi;/4 + 2&pi;/3)] = <strong>2&radic;2 [cos(5&pi;/12) + i sin(5&pi;/12)]</strong>.<br />
                                            (iii) &theta; = 3&pi;/2: z' = (2 - 2i)(-i) = -2i + 2i² = <strong>-2 - 2i</strong>.
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Section28Content;
