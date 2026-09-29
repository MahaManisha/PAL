import React, { useState } from 'react';
import {
    BookOpen, FileText, CheckSquare, Layers, Download, CheckCircle,
    Info, Eye, ChevronRight, HelpCircle, ArrowRight, Sparkles, Compass
} from 'lucide-react';

const Section25Content = ({ activeModule = 'content', onModuleChange }) => {
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
        content: '/videos/Mathematics/Chapter%202/Main%20Content/2.5/2.5_Content_Eng.pdf',
        example: '/videos/Mathematics/Chapter%202/Main%20Content/2.5/2.5_Example_Eng.pdf',
        exercise: '/videos/Mathematics/Chapter%202/Main%20Content/2.5/2.5_Exercise_Eng.pdf',
        all: '/videos/Mathematics/Chapter%202/Main%20Content/2.5/2.5_Content_Eng.pdf'
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
                        1. Theory & Core Concepts
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
                        2. Worked Examples (2.9 - 2.17)
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
                        3. Exercise 2.5 Solutions (Q1 - Q10)
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
                            title="Section 2.5 PDF Viewer"
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
                                    2.5 Modulus of a Complex Number
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Definition 2.4, Geometrical Distance in Argand Plane, 9 Properties of Modulus, Triangle Inequality Proof, Square Roots, Examples 2.9–2.17, and Exercise 2.5 Solutions.
                                </p>
                            </div>
                            <div style={{
                                padding: '0.4rem 0.9rem', borderRadius: '999px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)'
                            }}>
                                Section 2.5 Complete Content
                            </div>
                        </div>

                        {/* PART 1: THEORY */}
                        {(selectedModule === 'content' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
                                    <BookOpen size={22} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 1: Theory, Definitions & Properties (2.5_Content_Eng.pdf)
                                    </h2>
                                </div>

                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        DEFINITION 2.4 &bull; PAGE 67
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Modulus of a Complex Number
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        If <strong>z = x + iy</strong>, then the modulus or absolute value of z, denoted by <strong>|z|</strong>, is defined by:
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.6rem', borderLeft: '4px solid var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                                        |z| = &radic;(x² + y²) &ge; 0
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                                        <strong>Geometrical Meaning:</strong> In the Argand plane, |z| represents the straight-line distance from the origin (0, 0) to the point (x, y). The distance between any two complex numbers z₁ = x₁ + iy₁ and z₂ = x₂ + iy₂ is |z₁ - z₂| = &radic;((x₁ - x₂)² + (y₁ - y₂)²).
                                    </p>
                                </div>

                                {/* Properties Table */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        Core Properties of Modulus (Properties 1 – 9)
                                    </h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--input-bg)', textAlign: 'left', borderBottom: '2px solid var(--card-border)' }}>
                                                    <th style={{ padding: '0.6rem 0.8rem', width: '50px' }}>#</th>
                                                    <th style={{ padding: '0.6rem 0.8rem' }}>Property Name</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--primary)' }}>Mathematical Formula</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Significance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>1</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Conjugate Equality</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|z| = |z̄|</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Distance to origin is invariant under reflection</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>2</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Triangle Inequality</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|z₁ + z₂| &le; |z₁| + |z₂|</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Third side of triangle is &le; sum of two sides</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>3</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Product Rule</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|z₁z₂| = |z₁||z₂|</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Modulus of product equals product of moduli</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>4</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Difference Lower Bound</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|z₁ - z₂| &ge; ||z₁| - |z₂||</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Third side of triangle is &ge; difference of two sides</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>5</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Quotient Rule</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|z₁ / z₂| = |z₁| / |z₂| (z₂ &ne; 0)</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Modulus of quotient equals quotient of moduli</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>6</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Integer Powers</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|zⁿ| = |z|ⁿ</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>For any integer exponent n</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>7</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Real Part Bound</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>Re(z) &le; |Re(z)| &le; |z|</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Horizontal component cannot exceed total length</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>8</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Imaginary Part Bound</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>Im(z) &le; |Im(z)| &le; |z|</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Vertical component cannot exceed total length</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700 }}>9</td>
                                                    <td style={{ padding: '0.5rem 0.8rem' }}>Modulus-Conjugate Product</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>|z|² = z &bull; z̄</td>
                                                    <td style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>Fundamental connection to conjugation</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Proof: Triangle Inequality & Square Roots */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                                        Proof: Triangle Inequality |z₁ + z₂| &le; |z₁| + |z₂|
                                    </div>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                        |z₁ + z₂|² = (z₁ + z₂)(z̄₁ + z̄₂) = (z₁ + z₂)(z̄₁ + z̄₂)<br />
                                        = z₁z̄₁ + z₁z̄₂ + z₂z̄₁ + z₂z̄₂ = |z₁|² + (z₁z̄₂ + z̄₁z₂) + |z₂|²<br />
                                        = |z₁|² + 2 Re(z₁z̄₂) + |z₂|²<br />
                                        Since Re(w) &le; |w|, 2 Re(z₁z̄₂) &le; 2 |z₁z̄₂| = 2 |z₁||z₂|<br />
                                        &le; |z₁|² + 2|z₁||z₂| + |z₂|² = (|z₁| + |z₂|)²<br />
                                        Taking square roots: <strong>|z₁ + z₂| &le; |z₁| + |z₂|</strong>. Q.E.D.
                                    </div>

                                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                                        Formula: Square Root of a Complex Number z = a + ib
                                    </div>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.6' }}>
                                        &radic;(a + ib) = &plusmn; [ &radic;((|z| + a)/2) + i &bull; sgn(b) &bull; &radic;((|z| - a)/2) ]<br />
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            where |z| = &radic;(a² + b²) and sgn(b) = 1 if b &gt; 0, and -1 if b &lt; 0.
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* PART 2: WORKED EXAMPLES */}
                        {(selectedModule === 'example' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem' }}>
                                    <FileText size={22} color="#f59e0b" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 2: Worked Examples 2.9 to 2.17 (2.5_Example_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Examples 2.9, 2.11, 2.12 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: '0.3rem' }}>Example 2.9: Modulus Evaluation</div>
                                    <div style={{ fontSize: '0.88rem', fontFamily: 'monospace', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                        (i) |(2 - i)/(1 + i)| = |2 - i| / |1 + i| = &radic;(4 + 1) / &radic;(1 + 1) = &radic;5 / &radic;2 = <strong>&radic;(5/2)</strong><br />
                                        (ii) |(1 + i)(1 - 2i)| = |1 + i| &bull; |1 - 2i| = &radic;2 &bull; &radic;5 = <strong>&radic;10</strong><br />
                                        (iii) |(2 + i)³| = |2 + i|³ = (&radic;5)³ = <strong>5&radic;5</strong>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: '0.3rem' }}>Example 2.11: Equilateral Triangle Proof</div>
                                    <div style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                        Show that points 1, (-1 + i&radic;3)/2, and (-1 - i&radic;3)/2 form the vertices of an equilateral triangle.
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                        Let z₁ = 1, z₂ = -1/2 + i(&radic;3/2), z₃ = -1/2 - i(&radic;3/2).<br />
                                        |z₁ - z₂| = |3/2 - i&radic;3/2| = &radic;(9/4 + 3/4) = &radic;(12/4) = <strong>&radic;3</strong><br />
                                        |z₂ - z₃| = |i&radic;3| = <strong>&radic;3</strong><br />
                                        |z₃ - z₁| = |-3/2 - i&radic;3/2| = &radic;(9/4 + 3/4) = <strong>&radic;3</strong><br />
                                        Since all three sides equal &radic;3, the triangle is equilateral. Q.E.D.
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: '0.3rem' }}>Example 2.15: Symmetric Modulus Identity</div>
                                    <div style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                        If |z₁| = |z₂| = |z₃| = r &gt; 0 and z₁ + z₂ + z₃ &ne; 0, prove |(z₁z₂ + z₂z₃ + z₃z₁)/(z₁ + z₂ + z₃)| = r.
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                        Since |z_k| = r, z̄_k = r² / z_k.<br />
                                        |(z₁z₂ + z₂z₃ + z₃z₁)/(z₁ + z₂ + z₃)| = |(z̄₁z̄₂ + z̄₂z̄₃ + z̄₃z̄₁)/(z̄₁ + z̄₂ + z̄₃)|<br />
                                        = |(z̄₁z̄₂ + z̄₂z̄₃ + z̄₃z̄₁)/(z̄₁ + z̄₂ + z̄₃)|<br />
                                        = |[r⁴(z₁ + z₂ + z₃)/(z₁z₂z₃)] / [r²(z₁z₂ + z₂z₃ + z₃z₁)/(z₁z₂z₃)]|<br />
                                        = r² / |(z₁z₂ + z₂z₃ + z₃z₁)/(z₁ + z₂ + z₃)|<br />
                                        Multiplying both sides by the modulus gives Modulus² = r² &rArr; <strong>Modulus = r</strong>. Proved.
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: '0.3rem' }}>Example 2.16 & 2.17: Equations & Square Root</div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                        <strong>Example 2.16:</strong> Show z² = z̄ has 4 solutions.<br />
                                        |z²| = |z̄| &rArr; |z|² = |z| &rArr; |z|(|z| - 1) = 0.<br />
                                        &bull; |z| = 0 &rArr; z = 0 (1 solution).<br />
                                        &bull; |z| = 1 &rArr; z̄ = 1/z &rArr; z³ = 1 &rArr; z = 1, &omega;, &omega;² (3 solutions). Total = 4 solutions.<br /><br />
                                        <strong>Example 2.17:</strong> Find square root of 6 - 8i.<br />
                                        a = 6, b = -8, |z| = &radic;(36+64) = 10. Since b &lt; 0, sgn(b) = -1.<br />
                                        &radic;(6 - 8i) = &plusmn; [ &radic;((10+6)/2) - i &radic;((10-6)/2) ] = &plusmn;(&radic;8 - i&radic;2) = <strong>&plusmn;(2&radic;2 - i&radic;2)</strong>.
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* PART 3: EXERCISE 2.5 */}
                        {(selectedModule === 'exercise' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #10b981', paddingBottom: '0.5rem' }}>
                                    <CheckSquare size={22} color="#10b981" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 3: Exercise 2.5 Solved Solutions (2.5_Exercise_Eng.pdf)
                                    </h2>
                                </div>

                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 800, color: '#10b981', marginBottom: '0.4rem' }}>Questions 1 to 5: Modulus Calculations & Bounds</div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                        <strong>Q1 Moduli:</strong> (i) |2i/(3+4i)| = 2/5, (ii) |(2-i)/(1-2i)| = 1, (iii) |(1-i)¹⁰| = 32, (iv) |2i(3-4i)(4-3i)| = 50.<br /><br />
                                        <strong>Q2 Proof:</strong> |z₁|=|z₂|=1 &rArr; w = (z₁+z₂)/(1+z₁z₂). Conjugate w̄ = (1/z₁ + 1/z₂)/(1 + 1/z₁z₂) = w &rArr; Real.<br /><br />
                                        <strong>Q3 Closest Point:</strong> Dist to 10 - 8i = 9&radic;2 &approx; 12.73; Dist to 11 + 6i = 5&radic;5 &approx; 11.18 &rArr; 11 + 6i is closest.<br /><br />
                                        <strong>Q4:</strong> If |z|=3, |z + (6 - 8i)|: Upper bound 3 + 10 = 13, Lower bound |10 - 3| = 7 &rArr; <strong>7 &le; |z + 6 - 8i| &le; 13</strong>.<br /><br />
                                        <strong>Q5:</strong> If |z|=1, |z² - 3|: Upper bound 1 + 3 = 4, Lower bound |1 - 3| = 2 &rArr; <strong>2 &le; |z² - 3| &le; 4</strong>.
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontWeight: 800, color: '#10b981', marginBottom: '0.4rem' }}>Questions 6 to 10: Advanced Bounds, Areas & Square Roots</div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                        <strong>Q6:</strong> If |z|=2, |z + 6 + 8i|: Upper 2 + 10 = 12, Lower 10 - 2 = 8 &rArr; <strong>8 &le; |z + 6 + 8i| &le; 12</strong>.<br /><br />
                                        <strong>Q7:</strong> |z₁|=1, |z₂|=2, |z₃|=3 and |z₁+z₂+z₃|=1 &rArr; |9z₁z₂ + 4z₁z₃ + z₂z₃| = |z₁z₂z₃(z̄₁+z̄₂+z̄₃)| = 1&bull;2&bull;3&bull;1 = <strong>6</strong>.<br /><br />
                                        <strong>Q8 Triangle Area:</strong> Vertices z, iz, z+iz form right triangle of area 1/2|z|² = 50 &rArr; |z|² = 100 &rArr; <strong>|z| = 10</strong>.<br /><br />
                                        <strong>Q9 Equation:</strong> z³ + 2z̄ = 0 has <strong>5 solutions</strong> (z = 0 and 4 roots on circle |z| = &radic;2).<br /><br />
                                        <strong>Q10 Square Roots:</strong><br />
                                        (i) &radic;(4 + 3i) = &plusmn;(3/&radic;2 + i/&radic;2)<br />
                                        (ii) &radic;(-6 + 8i) = &plusmn;(&radic;2 + 2i&radic;2)<br />
                                        (iii) &radic;(-5 - 12i) = &plusmn;(2 - 3i)
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

export default Section25Content;
