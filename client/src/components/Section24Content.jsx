import React, { useState } from 'react';
import {
    BookOpen, FileText, CheckSquare, Layers, Download, CheckCircle,
    Info, Eye, ChevronRight, HelpCircle, ArrowRight, Sparkles, Compass
} from 'lucide-react';

const Section24Content = ({ activeModule = 'content', onModuleChange }) => {
    // Sub-view: 'interactive' or 'pdf'
    const [viewMode, setViewMode] = useState('interactive');
    const [selectedModule, setSelectedModule] = useState(activeModule);

    // Sync if parent changes tab
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
        content: '/videos/Mathematics/Chapter%202/Main%20Content/2.4/2.4_Content_Eng.pdf',
        example: '/videos/Mathematics/Chapter%202/Main%20Content/2.4/2.4_Example_Eng.pdf',
        exercise: '/videos/Mathematics/Chapter%202/Main%20Content/2.4/2.4_Exercise_Eng.pdf',
        all: '/videos/Mathematics/Chapter%202/Main%20Content/2.4/2.4_Content_Eng.pdf'
    };

    const currentPdfUrl = pdfMap[selectedModule] || pdfMap.content;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
            
            {/* ─── Control Bar: Module Switcher & View Mode Toggle ─── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--card-border)',
                background: 'rgba(255,255,255,0.02)', flexWrap: 'wrap', gap: '0.75rem'
            }}>
                {/* Module Filter Pills */}
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
                        2. Worked Examples (2.3 - 2.8)
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
                        3. Exercise 2.4 Solutions (Q1 - Q7)
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

                {/* View Switcher: Interactive vs PDF Document */}
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

            {/* ─── Main Content Container ─── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: viewMode === 'pdf' ? '0' : '1.5rem 1.75rem' }}>
                
                {viewMode === 'pdf' ? (
                    <div style={{ width: '100%', height: '100%', background: '#1e293b' }}>
                        <iframe
                            src={`${currentPdfUrl}#view=FitH&toolbar=0`}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            style={{ border: 'none', display: 'block', minHeight: '650px' }}
                            title="Section 2.4 PDF Viewer"
                        />
                    </div>
                ) : (
                    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Top Header Card */}
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
                                    2.4 Conjugate of a Complex Number
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Rigorous Algebraic Foundations, Geometric Argand Interpretations, 10 Core Properties, Worked Examples 2.3–2.8, and Exercise 2.4 Step-by-Step Solutions.
                                </p>
                            </div>
                            <div style={{
                                padding: '0.4rem 0.9rem', borderRadius: '999px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)'
                            }}>
                                3 Full Resources Combined
                            </div>
                        </div>

                        {/* ──────────────────────────────────────────────────────────── */}
                        {/* RESOURCE 1: THEORY & CORE CONCEPTS                           */}
                        {/* ──────────────────────────────────────────────────────────── */}
                        {(selectedModule === 'content' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
                                    <BookOpen size={22} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 1: Theory, Definitions & Properties (2.4_Content_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Formal Definition */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>
                                            DEFINITION 2.3 &bull; PAGE 60
                                        </span>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                            2.4 Formal Definition: Introducing the Conjugate Operator
                                        </h3>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        In mathematics, every complex number has a unique symmetric counterpart called its <strong>conjugate</strong>. Taking the conjugate of a complex number algebraically mirrors it across the real coordinate plane.
                                    </p>
                                    <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.7' }}>
                                        <li>Constructed by reversing the sign of the imaginary coefficient.</li>
                                        <li>Denoted explicitly by placing a horizontal bar (vinculum) over the variable as <strong>z̄</strong>.</li>
                                        <li>Crucial in simplifying ratios of complex values and rationalizing denominators.</li>
                                    </ul>
                                    <div style={{
                                        padding: '1rem', borderRadius: '0.65rem',
                                        background: 'rgba(99,102,241,0.08)', borderLeft: '4px solid var(--primary)',
                                        fontSize: '0.95rem', fontWeight: 600
                                    }}>
                                        <div>"The conjugate of the complex number x + iy is defined as the complex number x - iy."</div>
                                        <div style={{ marginTop: '0.4rem', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.05rem' }}>
                                            If z = x + iy, then z̄ = x - iy
                                        </div>
                                    </div>
                                </div>

                                {/* Algebraic Operations & Real Products */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        Algebraic Operations & Real Products
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        When any complex value <em>z</em> is multiplied by its own conjugate <em>z̄</em>, the imaginary components mathematically cancel out. This produces a <strong>purely real number</strong> equal to the sum of the squares of its coefficients.
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'var(--input-bg)', borderRadius: '0.6rem', border: '1px solid var(--card-border)', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>The Algebraic Transition:</div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text)' }}>
                                            (x + iy)(x - iy) = x² - (iy)² = x² - i²y²
                                        </div>
                                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                            Since i² = -1, the subtraction becomes addition:
                                        </div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.4rem' }}>
                                            z · z̄ = x² + y² = (Re(z))² + (Im(z))² &nbsp;&ge; 0 &nbsp;(Purely Real)
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.3rem' }}>EXAMPLE (i)</div>
                                            <div style={{ fontSize: '0.88rem' }}>Let <strong>z = 2 - 5i</strong></div>
                                            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>To obtain the conjugate, flip the coefficient of i:</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>z̄ = 2 + 5i</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.3rem' }}>EXAMPLE (ii)</div>
                                            <div style={{ fontSize: '0.88rem' }}>Compute the product of <strong>1 + 3i</strong> and its conjugate:</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>
                                                (1 + 3i)(1 - 3i) = (1)² - (3i)² = 1 - (-9) = 1 + 9 = 10
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2.4.1 Geometrical Representation in Argand Plane */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                        <Compass size={18} color="var(--primary)" />
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                            2.4.1 Geometrical Representation: Symmetry in the Argand Plane (Page 61)
                                        </h3>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        Geometrically, the complex conjugate of <em>z</em> is represented as the <strong>reflection of z across the real axis (horizontal axis)</strong> in the Argand plane.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                                Coordinate Behavior
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                                <li>The real coordinate <strong>x</strong> remains completely unchanged.</li>
                                                <li>The imaginary coordinate <strong>y</strong> flips across the horizontal line.</li>
                                                <li>This maps the coordinate point <strong>(x, y)</strong> directly onto <strong>(x, -y)</strong>.</li>
                                            </ul>
                                        </div>

                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                                Argand Reflections
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                                <div>&bull; <strong>Fig 2.14:</strong> Point (-2, 3) for <em>z = -2 + 3i</em> reflects to (-2, -3) for <em>z̄ = -2 - 3i</em>.</div>
                                                <div style={{ marginTop: '0.3rem' }}>&bull; <strong>Fig 2.15:</strong> Point (3, 2) for <em>z = 3 + 2i</em> reflects to (3, -2) for <em>z̄ = 3 - 2i</em>.</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slide 4 Diagram visual */}
                                    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--card-border)', background: '#0f172a', textAlign: 'center', padding: '0.5rem' }}>
                                        <img
                                            src="/videos/Mathematics/Chapter%202/Main%20Content/2.4/slides/2.4_Content_Eng_p04_image.jpg"
                                            alt="Fig 2.14 and 2.15: Argand Plane Reflection of Complex Conjugates"
                                            style={{ maxWidth: '100%', height: 'auto', maxHeight: '360px', objectFit: 'contain', borderRadius: '0.5rem' }}
                                        />
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>
                                            Figure 2.14 & 2.15: Argand Plane Reflection across Real Axis (Horizontal Line)
                                        </div>
                                    </div>
                                </div>

                                {/* Rationalization Rule */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        Rationalization & Complex Division: Why is the Conjugate Useful?
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        We cannot directly divide complex numbers when an imaginary component exists in the denominator. The conjugate acts as a <strong>"realizing factor"</strong> to eliminate imaginary terms.
                                    </p>
                                    <div style={{
                                        padding: '0.9rem 1rem', borderRadius: '0.6rem',
                                        background: 'rgba(16,185,129,0.08)', borderLeft: '4px solid #10b981',
                                        fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '0.85rem'
                                    }}>
                                        <strong>Rationalization Rule:</strong> To divide two complex numbers, replace the complex number in the denominator with a real number by multiplying both numerator and denominator by the conjugate of the denominator.
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text)', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                        Let quotient = z₁ / z₂.<br />
                                        Multiply with conjugate of denominator:<br />
                                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                            (z₁ / z₂) = (z₁ · z̄₂) / (z₂ · z̄₂) = (z₁ · z̄₂) / |z₂|²
                                        </span>
                                    </div>
                                </div>

                                {/* 2.4.2 Properties Table */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                                        2.4.2 Fundamental Properties of Complex Conjugates (Properties 1 – 10)
                                    </h3>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                                        Conjugates behave predictably under linear, arithmetic, and power transformations (Page 61 - 62):
                                    </p>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--input-bg)', textAlign: 'left', borderBottom: '2px solid var(--card-border)' }}>
                                                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)', width: '60px' }}>#</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text)' }}>Property Name</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--primary)' }}>Mathematical Formula</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Meaning / Condition</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>1</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Conjugate of a Sum</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>overline(z₁ + z₂) = z̄₁ + z̄₂</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Sum first or conjugate first gives same result</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>2</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Conjugate of a Difference</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>overline(z₁ - z₂) = z̄₁ - z̄₂</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Difference commutes with conjugation</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>3</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Conjugate of a Product</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>overline(z₁ · z₂) = z̄₁ · z̄₂</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Multiplication and conjugation commute</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>4</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Conjugate of a Quotient</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>overline(z₁ / z₂) = z̄₁ / z̄₂</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Provided z₂ &ne; 0</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>5</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Real Part Formula</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>Re(z) = (z + z̄) / 2</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Arithmetic mean of z and its conjugate</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>6</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Imaginary Part Formula</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>Im(z) = (z - z̄) / (2i)</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Difference divided by 2i</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>7</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Integer Powers</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>overline(zⁿ) = (z̄)ⁿ</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>For any integer exponent n</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>8</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Real Number Condition</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>z is purely real &hArr; z = z̄</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Invariant under conjugation</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>9</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Purely Imaginary Condition</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>z is purely imaginary &hArr; z = -z̄</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Equivalent to z̄ = -z</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>10</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Double Conjugation (Involution)</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>overline(z̄) = z</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Applying conjugate twice restores original number</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Rigorous Proofs Spotlight */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.2rem 0' }}>
                                        Rigorous Algebraic Proofs (Slide Deck Spotlights)
                                    </h3>

                                    {/* Proof 1 */}
                                    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Proof 1: Property 1 &bull; overline(z₁ + z₂) = z̄₁ + z̄₂</div>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>Q.E.D.</span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                                            Let z₁ = x₁ + iy₁ and z₂ = x₂ + iy₂.
                                        </p>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.88rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
                                            <strong>Step 1 (Compute LHS):</strong><br />
                                            z₁ + z₂ = (x₁ + x₂) + i(y₁ + y₂)<br />
                                            overline(z₁ + z₂) = (x₁ + x₂) - i(y₁ + y₂)<br /><br />
                                            <strong>Step 2 (Compute RHS):</strong><br />
                                            z̄₁ + z̄₂ = (x₁ - iy₁) + (x₂ - iy₂) = (x₁ + x₂) - i(y₁ + y₂)<br /><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>LHS = RHS. Q.E.D.</span>
                                        </div>
                                        <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            <em>Generalization:</em> By mathematical induction, this property scales to any finite sum: overline(&sum; z_k) = &sum; z̄_k.
                                        </div>
                                    </div>

                                    {/* Proof 3 */}
                                    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Proof 2: Property 3 &bull; overline(z₁ · z₂) = z̄₁ · z̄₂</div>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>Q.E.D.</span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                                            Let z₁ = x₁ + iy₁ and z₂ = x₂ + iy₂.
                                        </p>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.88rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
                                            <strong>LHS Calculation:</strong><br />
                                            z₁ · z₂ = (x₁x₂ - y₁y₂) + i(x₁y₂ + x₂y₁)<br />
                                            overline(z₁ · z₂) = (x₁x₂ - y₁y₂) - i(x₁y₂ + x₂y₁)<br /><br />
                                            <strong>RHS Calculation:</strong><br />
                                            z̄₁ · z̄₂ = (x₁ - iy₁)(x₂ - iy₂) = x₁x₂ - ix₁y₂ - ix₂y₁ + i²y₁y₂<br />
                                            = (x₁x₂ - y₁y₂) - i(x₁y₂ + x₂y₁)<br /><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>LHS = RHS. Q.E.D.</span>
                                        </div>
                                    </div>

                                    {/* Proof 9 */}
                                    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Proof 3: Property 9 &bull; Purely Imaginary Condition (z = -z̄)</div>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>Proved</span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                                            Let z = x + iy. Its conjugate is z̄ = x - iy.
                                        </p>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.88rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
                                            Assume z = -z̄:<br />
                                            x + iy = -(x - iy) = -x + iy<br />
                                            x + iy + x - iy = 0 &rArr; 2x = 0 &rArr; x = 0.<br />
                                            Since real part x = 0, z = 0 + iy = iy, which is purely imaginary.<br /><br />
                                            Conversely, if z is purely imaginary, x = 0 &rArr; z = iy.<br />
                                            z̄ = -iy = -z &rArr; z = -z̄.<br /><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Biconditional property verified. Proved.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Solved Lecture Examples 1 & 2 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.85rem 0' }}>
                                        Solved Lecture Examples (Slide 11)
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>EXAMPLE 1</div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>Find the conjugate of z = 2 / (1 - i):</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', fontFamily: 'monospace' }}>
                                                Multiply by denominator conjugate (1 + i):<br />
                                                z = 2(1 + i) / [(1 - i)(1 + i)]<br />
                                                z = 2(1 + i) / [1 - (-1)] = 2(1 + i) / 2 = 1 + i<br />
                                                Apply conjugate rule:<br />
                                                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>z̄ = overline(1 + i) = 1 - i</strong>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1rem', borderRadius: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>EXAMPLE 2</div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>Find the conjugate of z = (3 + 4i)(1 - 2i):</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', fontFamily: 'monospace' }}>
                                                Using Property 3, distribute conjugate first:<br />
                                                z̄ = overline(3 + 4i) &bull; overline(1 - 2i)<br />
                                                z̄ = (3 - 4i)(1 + 2i)<br />
                                                Expand terms:<br />
                                                = 3(1 + 2i) - 4i(1 + 2i)<br />
                                                = 3 + 6i - 4i - 8i² = 3 + 2i - 8(-1)<br />
                                                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>z̄ = 11 + 2i</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ──────────────────────────────────────────────────────────── */}
                        {/* RESOURCE 2: WORKED EXAMPLES 2.3 TO 2.8                       */}
                        {/* ──────────────────────────────────────────────────────────── */}
                        {(selectedModule === 'example' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem' }}>
                                    <FileText size={22} color="#f59e0b" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 2: Worked Examples 2.3 to 2.8 (2.4_Example_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Example 2.3 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>Example 2.3: Quotient Simplification</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Slide 2 - 4</span>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>
                                        Express the fraction <strong>(3 + 4i) / (5 - 12i)</strong> in standard rectangular form x + iy, and identify its real and imaginary parts.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        <strong>Solution Strategy:</strong> Rationalize by multiplying by the conjugate of denominator (5 + 12i):<br /><br />
                                        &bull; <strong>Numerator Expansion:</strong><br />
                                        (3 + 4i)(5 + 12i) = 15 + 36i + 20i + 48i² = 15 + 56i + 48(-1) = 15 - 48 + 56i = <strong>-33 + 56i</strong><br /><br />
                                        &bull; <strong>Denominator Product:</strong><br />
                                        (5 - 12i)(5 + 12i) = 5² - (12i)² = 25 - 144i² = 25 - 144(-1) = 25 + 144 = <strong>169</strong><br /><br />
                                        &bull; <strong>Reassembling Quotient:</strong><br />
                                        z = (-33 + 56i) / 169 = <strong>-33/169 + i(56/169)</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                        <div style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                                            Real Part Re(z) = -33/169
                                        </div>
                                        <div style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                                            Imaginary Part Im(z) = 56/169
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.4 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>Example 2.4: Cubic Rationalization</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Slide 5 - 6</span>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>
                                        Simplify <strong>((1 + i)/(1 - i))³ - ((1 - i)/(1 + i))³</strong> into standard rectangular form.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        <strong>Step 1 (Base 1 Simplification):</strong><br />
                                        (1 + i)/(1 - i) = [(1 + i)(1 + i)] / [(1 - i)(1 + i)] = (1 + 2i + i²) / (1² - i²)<br />
                                        = (1 + 2i - 1) / (1 - (-1)) = 2i / 2 = <strong>i</strong><br /><br />
                                        <strong>Step 2 (Reciprocal Base 2):</strong><br />
                                        (1 - i)/(1 + i) is the reciprocal of (1 + i)/(1 - i) = 1/i = -i/1 = <strong>-i</strong><br /><br />
                                        <strong>Step 3 (Cubic Difference Evaluation):</strong><br />
                                        Substitute back: (i)³ - (-i)³ = -i - [(-1)³ · i³] = -i - [(-1)(-i)] = -i - i = <strong>-2i</strong>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'inline-block' }}>
                                        Standard Rectangular Form: 0 - 2i (or -2i)
                                    </div>
                                </div>

                                {/* Example 2.5 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>Example 2.5: Complex Equation Solving for z</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Slide 7 - 9</span>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>
                                        If <strong>(z + 3) / (z - 5i) = (1 + 4i) / 2</strong>, find the complex number z in rectangular form.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        <strong>Step 1: Cross-Multiplication</strong><br />
                                        2(z + 3) = (1 + 4i)(z - 5i)<br />
                                        2z + 6 = (1 + 4i)z - 5i(1 + 4i)<br />
                                        2z + 6 = (1 + 4i)z - 5i - 20i² = (1 + 4i)z - 5i + 20<br /><br />
                                        <strong>Step 2: Collect Terms in z</strong><br />
                                        2z - (1 + 4i)z = 20 - 5i - 6<br />
                                        (2 - 1 - 4i)z = 14 - 5i<br />
                                        (1 - 4i)z = 14 - 5i<br /><br />
                                        <strong>Step 3: Isolate and Rationalize z</strong><br />
                                        z = (14 - 5i) / (1 - 4i) = [(14 - 5i)(1 + 4i)] / [(1 - 4i)(1 + 4i)]<br />
                                        Numerator = 14 + 56i - 5i - 20i² = 14 + 51i + 20 = 34 + 51i<br />
                                        Denominator = 1² + 4² = 1 + 16 = 17<br />
                                        z = (34 + 51i) / 17 = 34/17 + i(51/17) = <strong>2 + 3i</strong>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'inline-block' }}>
                                        Result: z = 2 + 3i
                                    </div>
                                </div>

                                {/* Example 2.6 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>Example 2.6: Coordinate Division</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Slide 10 - 11</span>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>
                                        If <strong>z₁ = 3 - 2i</strong> and <strong>z₂ = 6 + 4i</strong>, find <strong>z₁ / z₂</strong> in rectangular form.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        z₁ / z₂ = (3 - 2i) / (6 + 4i) = [(3 - 2i)(6 - 4i)] / [(6 + 4i)(6 - 4i)]<br /><br />
                                        &bull; Numerator = 18 - 12i - 12i + 8i² = 18 - 24i - 8 = 10 - 24i<br />
                                        &bull; Denominator = 6² + 4² = 36 + 16 = 52<br />
                                        &bull; Division = (10 - 24i) / 52 = 10/52 - i(24/52) = <strong>5/26 - i(6/13)</strong>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'inline-block' }}>
                                        Standard Form: 5/26 - i(6/13)
                                    </div>
                                </div>

                                {/* Example 2.7 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>Example 2.7: Multiplicative Inverse of a Product</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Slide 12 - 13</span>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>
                                        Find the multiplicative inverse <strong>z⁻¹</strong> of <strong>z = (2 + 3i)(1 - i)</strong>.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        <strong>Step 1: Simplify Product z</strong><br />
                                        z = 2(1 - i) + 3i(1 - i) = 2 - 2i + 3i - 3i² = 2 + i - 3(-1) = 2 + 3 + i = <strong>5 + i</strong><br /><br />
                                        <strong>Step 2: Reciprocal Inverse & Rationalization</strong><br />
                                        z⁻¹ = 1 / (5 + i) = 1(5 - i) / [(5 + i)(5 - i)]<br />
                                        = (5 - i) / (5² + 1²) = (5 - i) / (25 + 1) = (5 - i) / 26 = <strong>5/26 - i(1/26)</strong>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'inline-block' }}>
                                        Result: z⁻¹ = 5/26 - i(1/26)
                                    </div>
                                </div>

                                {/* Example 2.8(i) & (ii) */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>Example 2.8: Conjugate Symmetry Proofs</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Slide 14 - 18</span>
                                    </div>

                                    {/* 2.8(i) */}
                                    <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                            Part (i): Show that (2 + i&radic;3)¹⁰ + (2 - i&radic;3)¹⁰ is purely real.
                                        </div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                            Let z = (2 + i&radic;3)¹⁰ + (2 - i&radic;3)¹⁰.<br />
                                            Apply conjugate overbar: z̄ = overline((2 + i&radic;3)¹⁰ + (2 - i&radic;3)¹⁰)<br />
                                            Distribute sum (Property 1): z̄ = overline((2 + i&radic;3)¹⁰) + overline((2 - i&radic;3)¹⁰)<br />
                                            Swap integer exponent (Property 7): z̄ = (overline(2 + i&radic;3))¹⁰ + (overline(2 - i&radic;3))¹⁰<br />
                                            Evaluate conjugates: overline(2 + i&radic;3) = 2 - i&radic;3, overline(2 - i&radic;3) = 2 + i&radic;3<br />
                                            z̄ = (2 - i&radic;3)¹⁰ + (2 + i&radic;3)¹⁰ = (2 + i&radic;3)¹⁰ + (2 - i&radic;3)¹⁰ = <strong>z</strong><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Since z̄ = z, the value is purely Real. Q.E.D.</span>
                                        </div>
                                    </div>

                                    {/* 2.8(ii) */}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                            Part (ii): Show that ((19 + 9i)/(5 - 3i))¹⁵ - ((8 + i)/(1 + 2i))¹⁵ is purely imaginary.
                                        </div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                            <strong>Base 1 Simplification:</strong><br />
                                            (19 + 9i)/(5 - 3i) = [(19 + 9i)(5 + 3i)] / (5² + 3²) = (95 + 57i + 45i + 27i²) / (25 + 9) = (68 + 102i) / 34 = <strong>2 + 3i</strong><br /><br />
                                            <strong>Base 2 Simplification:</strong><br />
                                            (8 + i)/(1 + 2i) = [(8 + i)(1 - 2i)] / (1² + 2²) = (8 - 16i + i - 2i²) / (1 + 4) = (10 - 15i) / 5 = <strong>2 - 3i</strong><br /><br />
                                            <strong>Expression:</strong> z = (2 + 3i)¹⁵ - (2 - 3i)¹⁵<br />
                                            Taking Conjugate: z̄ = overline((2 + 3i)¹⁵ - (2 - 3i)¹⁵) = (overline(2 + 3i))¹⁵ - (overline(2 - 3i))¹⁵<br />
                                            = (2 - 3i)¹⁵ - (2 + 3i)¹⁵ = -[(2 + 3i)¹⁵ - (2 - 3i)¹⁵] = <strong>-z</strong><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Since z̄ = -z, the value is purely Imaginary. Q.E.D.</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ──────────────────────────────────────────────────────────── */}
                        {/* RESOURCE 3: EXERCISE 2.4 SOLUTIONS                           */}
                        {/* ──────────────────────────────────────────────────────────── */}
                        {(selectedModule === 'exercise' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #10b981', paddingBottom: '0.5rem' }}>
                                    <CheckSquare size={22} color="#10b981" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 3: Exercise 2.4 Solved Solutions (2.4_Exercise_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Question 1 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 1: Rectangular Form of Complex Expressions</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 2 - 6</span>
                                    </div>
                                    
                                    {/* Q1(i) */}
                                    <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>(i) overline((5 + 9i) + (2 - 4i))</div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            Step 1 (Sum): (5 + 2) + (9 - 4)i = 7 + 5i<br />
                                            Step 2 (Conjugate): overline(7 + 5i) = <strong>7 - 5i</strong><br />
                                            Rectangular form: x + iy with x = 7, y = -5 &rArr; <span style={{ color: '#10b981', fontWeight: 700 }}>7 - 5i</span>
                                        </div>
                                    </div>

                                    {/* Q1(ii) */}
                                    <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>(ii) (10 - 5i) / (6 + 2i)</div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            Multiply by conjugate (6 - 2i):<br />
                                            Numerator: (10 - 5i)(6 - 2i) = 60 - 20i - 30i + 10i² = 60 - 50i - 10 = 50 - 50i<br />
                                            Denominator: 6² + 2² = 36 + 4 = 40<br />
                                            Division: (50 - 50i) / 40 = 50/40 - i(50/40) = <span style={{ color: '#10b981', fontWeight: 700 }}>5/4 - (5/4)i</span>
                                        </div>
                                    </div>

                                    {/* Q1(iii) */}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>(iii) overline(3i) + 1 / (2 - i)</div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            Term 1: overline(3i) = overline(0 + 3i) = -3i<br />
                                            Term 2: 1 / (2 - i) = 1(2 + i) / (2² + 1²) = (2 + i) / 5 = 2/5 + (1/5)i<br />
                                            Sum: -3i + 2/5 + (1/5)i = 2/5 + (1/5 - 3)i = 2/5 + (1/5 - 15/5)i = <span style={{ color: '#10b981', fontWeight: 700 }}>2/5 - (14/5)i</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question 2 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 2: Real and Imaginary Part Evaluations</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 7 - 10</span>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>If z = x + iy, find the following in rectangular form:</p>

                                    {/* Q2(i) */}
                                    <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>(i) Re(1/z)</div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            1/z = 1 / (x + iy) = (x - iy) / [(x + iy)(x - iy)] = (x - iy) / (x² + y²)<br />
                                            = x / (x² + y²) - i &bull; [y / (x² + y²)]<br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Re(1/z) = x / (x² + y²)</span> &nbsp;(and Im(1/z) = -y / (x² + y²))
                                        </div>
                                    </div>

                                    {/* Q2(ii) */}
                                    <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>(ii) Re(i·z̄)</div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            z̄ = x - iy<br />
                                            i·z̄ = i(x - iy) = ix - i²y = ix - (-1)y = y + ix<br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Re(i·z̄) = y</span>
                                        </div>
                                    </div>

                                    {/* Q2(iii) */}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>(iii) Im(3z + 4z̄ - 4i)</div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            W = 3(x + iy) + 4(x - iy) - 4i = 3x + 3iy + 4x - 4iy - 4i<br />
                                            W = (3x + 4x) + i(3y - 4y - 4) = 7x + i(-y - 4)<br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Im(3z + 4z̄ - 4i) = -y - 4 &nbsp;[or -(y + 4)]</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question 3 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 3: Inverse of Product and Division Ratio</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 11 - 13</span>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                                        Given <strong>z₁ = 2 - i</strong> and <strong>z₂ = -4 + 3i</strong>, find the inverse of <strong>z₁z₂</strong> and <strong>z₁ / z₂</strong>.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        <strong>Part 1: Compute Product z₁z₂:</strong><br />
                                        z₁z₂ = (2 - i)(-4 + 3i) = 2(-4 + 3i) - i(-4 + 3i) = -8 + 6i + 4i - 3i²<br />
                                        = -8 + 10i - 3(-1) = -8 + 10i + 3 = <strong>-5 + 10i</strong><br /><br />
                                        <strong>Part 2: Multiplicative Inverse (z₁z₂)⁻¹:</strong><br />
                                        (z₁z₂)⁻¹ = 1 / (-5 + 10i) = 1 / [5(-1 + 2i)] = (-1 - 2i) / [5((-1)² + 2²)]<br />
                                        = (-1 - 2i) / [5(1 + 4)] = (-1 - 2i) / 25 = <span style={{ color: '#10b981', fontWeight: 700 }}>-1/25 - i(2/25)</span><br /><br />
                                        <strong>Part 3: Complex Ratio Division z₁ / z₂:</strong><br />
                                        z₁ / z₂ = (2 - i) / (-4 + 3i) = [(2 - i)(-4 - 3i)] / [(-4)² + 3²]<br />
                                        = (-8 - 6i + 4i + 3i²) / (16 + 9) = (-8 - 2i - 3) / 25 = <span style={{ color: '#10b981', fontWeight: 700 }}>-11/25 - i(2/25)</span>
                                    </div>
                                </div>

                                {/* Question 4 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 4: Inverse Parallel Formula Solving for u</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 14 - 15</span>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                                        The complex variables are related by <strong>1/u = 1/v + 1/w</strong>. If <strong>v = 3 - 4i</strong> and <strong>w = 4 + 3i</strong>, find <strong>u</strong> in rectangular form.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        1/u = 1/v + 1/w = (v + w) / (vw) &rArr; <strong>u = (vw) / (v + w)</strong><br /><br />
                                        &bull; <strong>Denominator Sum:</strong> v + w = (3 - 4i) + (4 + 3i) = 7 - i<br />
                                        &bull; <strong>Numerator Product:</strong> vw = (3 - 4i)(4 + 3i) = 12 + 9i - 16i - 12i² = 12 - 7i + 12 = 24 - 7i<br />
                                        &bull; <strong>Quotient Setup:</strong> u = (24 - 7i) / (7 - i)<br />
                                        &bull; <strong>Rationalize with (7 + i):</strong><br />
                                        u = [(24 - 7i)(7 + i)] / [(7 - i)(7 + i)]<br />
                                        Numerator = 168 + 24i - 49i - 7i² = 168 - 25i + 7 = 175 - 25i<br />
                                        Denominator = 7² + 1² = 49 + 1 = 50<br />
                                        u = (175 - 25i) / 50 = 175/50 - i(25/50) = <span style={{ color: '#10b981', fontWeight: 700 }}>7/2 - (1/2)i</span>
                                    </div>
                                </div>

                                {/* Question 5 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 5: Theoretical Property Proofs</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 16 - 17</span>
                                    </div>

                                    {/* Q5(i) */}
                                    <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                                            (i) Prove that complex number z is purely real if and only if z = z̄:
                                        </div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            <strong>Direct Proof:</strong> Assume z = x + iy is purely real &rArr; y = 0.<br />
                                            z = x + i(0) = x. Take conjugate: z̄ = x - i(0) = x. Therefore z = z̄.<br /><br />
                                            <strong>Converse Proof:</strong> Assume z = z̄ where z = x + iy.<br />
                                            x + iy = x - iy &rArr; 2iy = 0 &rArr; y = 0.<br />
                                            Since imaginary coefficient is zero, z is purely real.<br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Q.E.D.</span>
                                        </div>
                                    </div>

                                    {/* Q5(ii) */}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                                            (ii) Prove that Re(z) = (z + z̄) / 2 and Im(z) = (z - z̄) / (2i):
                                        </div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            Let z = x + iy and z̄ = x - iy.<br /><br />
                                            <strong>1. Proof for Re(z):</strong><br />
                                            z + z̄ = (x + iy) + (x - iy) = 2x &rArr; x = (z + z̄) / 2.<br />
                                            Since Re(z) = x, this verifies <strong>Re(z) = (z + z̄) / 2</strong>.<br /><br />
                                            <strong>2. Proof for Im(z):</strong><br />
                                            z - z̄ = (x + iy) - (x - iy) = 2iy &rArr; y = (z - z̄) / (2i).<br />
                                            Since Im(z) = y, this verifies <strong>Im(z) = (z - z̄) / (2i)</strong>.<br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Q.E.D.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question 6 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 6: Least Positive Integer n via De Moivre's Theorem</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 18 - 19</span>
                                    </div>
                                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>
                                        Find the least positive integer n for which (&radic;3 + i)ⁿ is: (i) real, and (ii) purely imaginary.
                                    </p>
                                    <div style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}>
                                        <strong>Step 1: Convert z = &radic;3 + i to Polar Form</strong><br />
                                        Modulus r = &radic;[(&radic;3)² + 1²] = &radic;(3 + 1) = 2<br />
                                        Phase angle &theta; = tan⁻¹(1 / &radic;3) = &pi;/6 (in 1st quadrant)<br />
                                        Polar form: z = 2(cos(&pi;/6) + i&bull;sin(&pi;/6))<br /><br />
                                        <strong>Step 2: Apply De Moivre's Theorem</strong><br />
                                        zⁿ = 2ⁿ [cos(n&pi;/6) + i&bull;sin(n&pi;/6)]<br /><br />
                                        <strong>Case (i): Purely Real Value</strong><br />
                                        The imaginary coefficient must resolve to zero: sin(n&pi;/6) = 0<br />
                                        General solution: n&pi;/6 = k&pi; &rArr; n = 6k (where k &isin; &Zopf;)<br />
                                        To find the smallest positive integer n, choose k = 1: <strong style={{ color: '#10b981' }}>n = 6</strong><br /><br />
                                        <strong>Case (ii): Purely Imaginary Value</strong><br />
                                        The real coefficient must resolve to zero: cos(n&pi;/6) = 0<br />
                                        General solution: n&pi;/6 = (2k + 1)(&pi;/2) &rArr; n = 3(2k + 1) = 6k + 3<br />
                                        To find the smallest positive integer n, choose k = 0: <strong style={{ color: '#10b981' }}>n = 3</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                        <div style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                                            (i) Real: Least n = 6
                                        </div>
                                        <div style={{ padding: '0.4rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                                            (ii) Purely Imaginary: Least n = 3
                                        </div>
                                    </div>
                                </div>

                                {/* Question 7 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>Question 7: Advanced Symmetry Proofs using Overbars</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Slide 20 - 22</span>
                                    </div>

                                    {/* Q7(i) */}
                                    <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                                            (i) Show that z = (2 + i&radic;3)¹⁰ - (2 - i&radic;3)¹⁰ is purely imaginary:
                                        </div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            Recall purely imaginary condition: z̄ = -z.<br />
                                            Apply conjugate: z̄ = overline((2 + i&radic;3)¹⁰ - (2 - i&radic;3)¹⁰)<br />
                                            = (overline(2 + i&radic;3))¹⁰ - (overline(2 - i&radic;3))¹⁰<br />
                                            = (2 - i&radic;3)¹⁰ - (2 + i&radic;3)¹⁰<br />
                                            = -[(2 + i&radic;3)¹⁰ - (2 - i&radic;3)¹⁰] = <strong>-z</strong><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Since z̄ = -z, the term is purely Imaginary. Proved.</span>
                                        </div>
                                    </div>

                                    {/* Q7(ii) */}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                                            (ii) Show that ((19 - 7i)/(9 + i))¹² + ((20 - 5i)/(7 - 6i))¹² is purely real:
                                        </div>
                                        <div style={{ background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            <strong>Base 1 Rationalization:</strong><br />
                                            (19 - 7i)/(9 + i) = [(19 - 7i)(9 - i)] / (9² + 1²) = (171 - 19i - 63i + 7i²) / 82<br />
                                            = (164 - 82i) / 82 = <strong>2 - i</strong><br /><br />
                                            <strong>Base 2 Rationalization:</strong><br />
                                            (20 - 5i)/(7 - 6i) = [(20 - 5i)(7 + 6i)] / (7² + 6²) = (140 + 120i - 35i - 30i²) / 85<br />
                                            = (170 + 85i) / 85 = <strong>2 + i</strong><br /><br />
                                            <strong>Expression:</strong> z = (2 - i)¹² + (2 + i)¹²<br />
                                            Take conjugate: z̄ = overline((2 - i)¹² + (2 + i)¹²)<br />
                                            = (overline(2 - i))¹² + (overline(2 + i))¹²<br />
                                            = (2 + i)¹² + (2 - i)¹² = (2 - i)¹² + (2 + i)¹² = <strong>z</strong><br />
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>Since z̄ = z, the term evaluates to a purely Real value. Proved.</span>
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

export default Section24Content;
