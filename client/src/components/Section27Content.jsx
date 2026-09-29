import React, { useState } from 'react';
import {
    BookOpen, FileText, CheckSquare, Layers, Download, CheckCircle,
    Info, Eye, ChevronRight, HelpCircle, ArrowRight, Compass, Orbit
} from 'lucide-react';

const Section27Content = ({ activeModule = 'content', onModuleChange }) => {
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
        content: '/videos/Mathematics/Chapter%202/Main%20Content/2.7/2.7_content_Eng.pdf',
        example: '/videos/Mathematics/Chapter%202/Main%20Content/2.7/2.7_Example_Eng.pdf',
        exercise: '/videos/Mathematics/Chapter%202/Main%20Content/2.7/2.7_Exercise_Eng.pdf',
        all: '/videos/Mathematics/Chapter%202/Main%20Content/2.7/2.7_content_Eng.pdf'
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
                        1. Polar & Euler Form Theory
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
                        2. Worked Examples (2.22 - 2.27)
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
                        3. Exercise 2.7 Solutions (Q1 - Q6)
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
                            title="Section 2.7 PDF Viewer"
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
                                    2.7 Polar and Euler Form of a Complex Number
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Definition 2.6, Modulus r, Argument θ, Principal Argument Arg(z) in 4 Quadrants, Euler's Exponential Form e^(iθ), Product and Quotient Angle Rules, Examples 2.22–2.27, and Exercise 2.7.
                                </p>
                            </div>
                            <div style={{
                                padding: '0.4rem 0.9rem', borderRadius: '999px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)'
                            }}>
                                Section 2.7 Complete Content
                            </div>
                        </div>

                        {/* PART 1: THEORY */}
                        {(selectedModule === 'content' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
                                    <Orbit size={22} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 1: Theory, Polar Coordinates & Euler's Formula (2.7_content_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Why Polar Form */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Why Polar Form?
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                                        While the rectangular form <strong>z = x + iy</strong> is straightforward for addition and subtraction, multiplication, division, finding powers, and calculating roots become significantly simpler and more elegant when complex numbers are expressed in terms of distance from origin and angle of rotation — the <strong>polar form</strong>.
                                    </p>
                                </div>

                                {/* Definition 2.6 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        DEFINITION 2.6 &bull; PAGE 78
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Polar Form of a Complex Number
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        Let r and &theta; be the polar coordinates of the point P(x, y) that corresponds to a non-zero complex number z = x + iy. Then x = r cos &theta; and y = r sin &theta;.
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.6rem', borderLeft: '4px solid var(--primary)', fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                                        z = r(cos &theta; + i sin &theta;) = r cis &theta;
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                                        where <strong>r = |z| = &radic;(x² + y²) &ge; 0</strong> is the modulus of z, and <strong>&theta; = arg(z)</strong> is the argument or amplitude of z.
                                    </p>
                                </div>

                                {/* General vs Principal Argument */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        General Argument vs. Principal Argument Arg(z)
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.75rem 0' }}>
                                        Since cosine and sine are periodic functions with period 2&pi;, there are infinitely many values of &theta; that satisfy the equation.
                                    </p>
                                    <div style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                                        -&pi; &lt; Arg(z) &le; &pi; &nbsp; (Principal Argument)<br />
                                        arg(z) = Arg(z) + 2n&pi;, &nbsp; n &isin; &integers;
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text)', margin: 0 }}>
                                        The unique value of &theta; in the interval <strong>(-&pi;, &pi;]</strong> is denoted as <strong>Arg(z)</strong> (with capital 'A').
                                    </p>
                                </div>

                                {/* Quadrant Rules Table */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Reference Angle &alpha; &amp; 4-Quadrant Determination
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        First compute the acute reference angle <strong>&alpha; = tan⁻¹|y/x|</strong> (where 0 &lt; &alpha; &lt; &pi;/2). Then determine &theta; based on which quadrant z lies in:
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>Quadrant I (x &gt; 0, y &gt; 0)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>&theta; = &alpha;</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f59e0b', marginBottom: '0.2rem' }}>Quadrant II (x &lt; 0, y &gt; 0)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>&theta; = &pi; - &alpha;</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ef4444', marginBottom: '0.2rem' }}>Quadrant III (x &lt; 0, y &lt; 0)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>&theta; = &alpha; - &pi; &nbsp; [-( &pi; - &alpha; )]</div>
                                        </div>
                                        <div style={{ padding: '0.85rem', borderRadius: '0.6rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#10b981', marginBottom: '0.2rem' }}>Quadrant IV (x &gt; 0, y &lt; 0)</div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>&theta; = -&alpha;</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Euler's Form & Properties */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        Euler's Formula &amp; Exponential Representation
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.8rem 0' }}>
                                        Euler's identity establishes that <strong>e^(i&theta;) = cos &theta; + i sin &theta;</strong>. Consequently:
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.6rem', borderLeft: '4px solid var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                                        z = r e^(i&theta;) &nbsp; (Euler's Form)
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.8' }}>
                                        <li><strong>Product Rule:</strong> z₁z₂ = r₁r₂ [cos(&theta;₁ + &theta;₂) + i sin(&theta;₁ + &theta;₂)] &rArr; arg(z₁z₂) = arg(z₁) + arg(z₂)</li>
                                        <li><strong>Quotient Rule:</strong> z₁/z₂ = (r₁/r₂) [cos(&theta;₁ - &theta;₂) + i sin(&theta;₁ - &theta;₂)] &rArr; arg(z₁/z₂) = arg(z₁) - arg(z₂)</li>
                                        <li><strong>Inverse:</strong> z⁻¹ = (1/r) [cos &theta; - i sin &theta;] = (1/r) e^(-i&theta;) &rArr; arg(z⁻¹) = -arg(z)</li>
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
                                        Part 2: Worked Examples 2.22 to 2.27 (2.7_Example_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Example 2.22 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.22 &bull; PAGE 82
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>4 Quadrants Modulus &amp; Argument</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the modulus and principal argument of: (i) &radic;3 + i, (ii) -&radic;3 + i, (iii) -&radic;3 - i, (iv) &radic;3 - i.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.4rem 0' }}>For all four numbers, r = &radic;((&plusmn;&radic;3)² + (&plusmn;1)²) = &radic;(3 + 1) = <strong>2</strong>.</p>
                                        <p style={{ margin: '0 0 0.4rem 0' }}>Reference angle &alpha; = tan⁻¹|y/x| = tan⁻¹(1/&radic;3) = <strong>&pi;/6</strong>.</p>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                            <li><strong>(i) &radic;3 + i (Quad I):</strong> &theta; = &alpha; = <strong>&pi;/6</strong>. (Modulus = 2, Arg = &pi;/6)</li>
                                            <li><strong>(ii) -&radic;3 + i (Quad II):</strong> &theta; = &pi; - &alpha; = &pi; - &pi;/6 = <strong>5&pi;/6</strong>. (Modulus = 2, Arg = 5&pi;/6)</li>
                                            <li><strong>(iii) -&radic;3 - i (Quad III):</strong> &theta; = &alpha; - &pi; = &pi;/6 - &pi; = <strong>-5&pi;/6</strong>. (Modulus = 2, Arg = -5&pi;/6)</li>
                                            <li><strong>(iv) &radic;3 - i (Quad IV):</strong> &theta; = -&alpha; = <strong>-&pi;/6</strong>. (Modulus = 2, Arg = -&pi;/6)</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Example 2.23 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.23 &bull; PAGE 83
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Polar Form Conversion</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Represent (i) -1 - i and (ii) 1 + i&radic;3 in polar form.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}><strong>(i) -1 - i:</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0 0 0.6rem 0' }}>
                                            r = &radic;((-1)² + (-1)²) = &radic;2. &alpha; = tan⁻¹| -1 / -1 | = &pi;/4.<br />
                                            Point lies in Quad III &rArr; &theta; = &alpha; - &pi; = &pi;/4 - &pi; = -3&pi;/4.<br />
                                            Polar form: <strong>&radic;2 [cos(-3&pi;/4) + i sin(-3&pi;/4)]</strong> = &radic;2 [cos(3&pi;/4) - i sin(3&pi;/4)].
                                        </div>
                                        <p style={{ margin: '0 0 0.3rem 0' }}><strong>(ii) 1 + i&radic;3:</strong></p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            r = &radic;(1² + (&radic;3)²) = 2. &alpha; = tan⁻¹(&radic;3) = &pi;/3.<br />
                                            Point lies in Quad I &rArr; &theta; = &alpha; = &pi;/3.<br />
                                            Polar form: <strong>2(cos &pi;/3 + i sin &pi;/3)</strong>.<br />
                                            General form: <strong>2[cos(&pi;/3 + 2k&pi;) + i sin(&pi;/3 + 2k&pi;)], k &isin; &integers;</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.24 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.24 &bull; PAGE 83
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quotient Argument</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the principal argument Arg(z) when z = -2 / (1 + i&radic;3).
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Using the quotient argument property: arg(z₁/z₂) = arg(z₁) - arg(z₂):</p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            arg(-2) = &pi; (negative real axis)<br />
                                            arg(1 + i&radic;3) = &pi;/3 (Quadrant I)<br />
                                            arg(z) = &pi; - &pi;/3 = <strong>2&pi;/3</strong>
                                        </div>
                                        <p style={{ margin: '0.4rem 0 0 0', color: '#10b981', fontWeight: 700 }}>
                                            Since 2&pi;/3 lies within (-&pi;, &pi;], Arg(z) = 2&pi;/3.
                                        </p>
                                    </div>
                                </div>

                                {/* Example 2.25 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.25 &bull; PAGE 84
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Product in Rectangular Form</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the product (3/2)(cos &pi;/3 + i sin &pi;/3) &times; 6(cos 5&pi;/6 + i sin 5&pi;/6) in rectangular form.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            Modulus = (3/2) &times; 6 = 9.<br />
                                            Sum of angles = &pi;/3 + 5&pi;/6 = 2&pi;/6 + 5&pi;/6 = 7&pi;/6.<br />
                                            Product = 9 [cos(7&pi;/6) + i sin(7&pi;/6)]<br />
                                            = 9 [cos(&pi; + &pi;/6) + i sin(&pi; + &pi;/6)]<br />
                                            = 9 [-cos(&pi;/6) - i sin(&pi;/6)]<br />
                                            = 9 [-&radic;3/2 - i(1/2)] = <strong>-9&radic;3/2 - (9/2)i</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.26 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.26 &bull; PAGE 84
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quotient in Rectangular Form</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the quotient 2(cos 9&pi;/4 + i sin 9&pi;/4) &divide; 4(cos(-3&pi;/2) + i sin(-3&pi;/2)) in rectangular form.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            Modulus = 2 / 4 = 1/2.<br />
                                            Difference of angles = 9&pi;/4 - (-3&pi;/2) = 9&pi;/4 + 6&pi;/4 = 15&pi;/4 = 4&pi; - &pi;/4 &equiv; -&pi;/4.<br />
                                            Quotient = (1/2) [cos(-&pi;/4) + i sin(-&pi;/4)]<br />
                                            = (1/2) [1/&radic;2 - i(1/&radic;2)] = <strong>&radic;2/4 - i(&radic;2/4)</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.27 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.27 &bull; PAGE 84
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Locus from Argument Condition</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If z = x + iy and arg((z - 1)/(z + 1)) = &pi;/2, show that x² + y² = 1.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            (z - 1)/(z + 1) = [(x - 1) + iy] / [(x + 1) + iy]<br />
                                            Multiply numerator and denominator by [(x + 1) - iy]:<br />
                                            = {`{[(x - 1)(x + 1) + y²] + i[y(x + 1) - y(x - 1)]}`} / [(x + 1)² + y²]<br />
                                            = [(x² - 1 + y²) + i(2y)] / [(x + 1)² + y²]
                                        </div>
                                        <p style={{ margin: '0.4rem 0' }}>
                                            Since arg(w) = &pi;/2, the real part must be 0 and the imaginary part must be positive:
                                        </p>
                                        <div style={{ color: '#10b981', fontWeight: 700 }}>
                                            x² + y² - 1 = 0 &rArr; x² + y² = 1 (with y &gt; 0). Q.E.D.
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* PART 3: EXERCISE SOLUTIONS */}
                        {(selectedModule === 'exercise' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #10b981', paddingBottom: '0.5rem' }}>
                                    <Compass size={22} color="#10b981" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 3: Exercise 2.7 Full Solutions (2.7_Exercise_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Q1 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.7 &bull; QUESTION 1
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Write in polar form: (i) 2 + i2&radic;3, (ii) 3 - i&radic;3, (iii) -2 - i2, (iv) i - 1.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                            <li style={{ marginBottom: '0.4rem' }}>
                                                <strong>(i) 2 + i2&radic;3:</strong> r = &radic;(4 + 12) = 4, &alpha; = tan⁻¹(&radic;3) = &pi;/3 (Quad I &rArr; &theta; = &pi;/3).<br />
                                                Polar Form: <strong>4(cos &pi;/3 + i sin &pi;/3)</strong>
                                            </li>
                                            <li style={{ marginBottom: '0.4rem' }}>
                                                <strong>(ii) 3 - i&radic;3:</strong> r = &radic;(9 + 3) = 2&radic;3, &alpha; = tan⁻¹(1/&radic;3) = &pi;/6 (Quad IV &rArr; &theta; = -&pi;/6).<br />
                                                Polar Form: <strong>2&radic;3 [cos(-&pi;/6) + i sin(-&pi;/6)]</strong>
                                            </li>
                                            <li style={{ marginBottom: '0.4rem' }}>
                                                <strong>(iii) -2 - i2:</strong> r = &radic;(4 + 4) = 2&radic;2, &alpha; = tan⁻¹(1) = &pi;/4 (Quad III &rArr; &theta; = &pi;/4 - &pi; = -3&pi;/4).<br />
                                                Polar Form: <strong>2&radic;2 [cos(-3&pi;/4) + i sin(-3&pi;/4)]</strong>
                                            </li>
                                            <li>
                                                <strong>(iv) i - 1 = -1 + i:</strong> r = &radic;(1 + 1) = &radic;2, &alpha; = tan⁻¹(1) = &pi;/4 (Quad II &rArr; &theta; = &pi; - &pi;/4 = 3&pi;/4).<br />
                                                Polar Form: <strong>&radic;2(cos 3&pi;/4 + i sin 3&pi;/4)</strong>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Q2 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.7 &bull; QUESTION 2
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Find the rectangular form of: (i) (cos &pi;/6 + i sin &pi;/6)(cos &pi;/12 + i sin &pi;/12), (ii) [cos &pi;/6 - i sin &pi;/6] / [2(cos &pi;/3 + i sin &pi;/3)].
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}><strong>(i) Angle addition:</strong> &pi;/6 + &pi;/12 = 3&pi;/12 = &pi;/4.</p>
                                        <div style={{ fontFamily: 'monospace', margin: '0 0 0.5rem 0' }}>
                                            = cos &pi;/4 + i sin &pi;/4 = 1/&radic;2 + i(1/&radic;2) = <strong>&radic;2/2 + i(&radic;2/2)</strong>
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0.3rem 0' }}><strong>(ii) Angle subtraction:</strong> cos &pi;/6 - i sin &pi;/6 = cos(-&pi;/6) + i sin(-&pi;/6).</p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            Angle difference = -&pi;/6 - &pi;/3 = -3&pi;/6 = -&pi;/2.<br />
                                            = (1/2)[cos(-&pi;/2) + i sin(-&pi;/2)] = (1/2)[0 - i] = <strong>-i/2</strong>.
                                        </div>
                                    </div>
                                </div>

                                {/* Q3 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.7 &bull; QUESTION 3
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If (x₁ + iy₁)(x₂ + iy₂)···(xₙ + iyₙ) = a + ib, show that: (i) (x₁² + y₁²)(x₂² + y₂²)···(xₙ² + yₙ²) = a² + b², (ii) &Sigma; tan⁻¹(yᵣ/xᵣ) = tan⁻¹(b/a) + 2k&pi;, k &isin; &integers;.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}><strong>(i) Taking modulus on both sides:</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0 0 0.5rem 0' }}>
                                            |z₁z₂···zₙ| = |a + ib| &rArr; |z₁||z₂|···|zₙ| = |a + ib|<br />
                                            Squaring both sides: (x₁² + y₁²)(x₂² + y₂²)···(xₙ² + yₙ²) = a² + b². Proved.
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0.3rem 0' }}><strong>(ii) Taking argument on both sides:</strong></p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            arg(z₁z₂···zₙ) = arg(a + ib) &rArr; arg(z₁) + arg(z₂) + ··· + arg(zₙ) = arg(a + ib) + 2k&pi;<br />
                                            Since arg(xᵣ + iyᵣ) = tan⁻¹(yᵣ/xᵣ) and arg(a + ib) = tan⁻¹(b/a):<br />
                                            <strong>&Sigma; tan⁻¹(yᵣ/xᵣ) = tan⁻¹(b/a) + 2k&pi;, k &isin; &integers;</strong>. Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q4 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.7 &bull; QUESTION 4
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If (1 + z)/(1 - z) = cos 2&theta; + i sin 2&theta;, show that z = i tan &theta;.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            cos 2&theta; + i sin 2&theta; = e^(i2&theta;) = (cos &theta; + i sin &theta;)/(cos &theta; - i sin &theta;) = (1 + i tan &theta;)/(1 - i tan &theta;)<br />
                                            Applying Componendo and Dividendo:<br />
                                            [(1 + z) - (1 - z)] / [(1 + z) + (1 - z)] = [(1 + i tan &theta;) - (1 - i tan &theta;)] / [(1 + i tan &theta;) + (1 - i tan &theta;)]<br />
                                            2z / 2 = (2i tan &theta;) / 2 &rArr; <strong>z = i tan &theta;</strong>. Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q5 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.7 &bull; QUESTION 5
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If cos &alpha; + cos &beta; + cos &gamma; = sin &alpha; + sin &beta; + sin &gamma; = 0, show that: (i) cos 3&alpha; + cos 3&beta; + cos 3&gamma; = 3 cos(&alpha; + &beta; + &gamma;), (ii) sin 3&alpha; + sin 3&beta; + sin 3&gamma; = 3 sin(&alpha; + &beta; + &gamma;).
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Let a = e^(i&alpha;), b = e^(i&beta;), c = e^(i&gamma;).</p>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            a + b + c = (cos &alpha; + cos &beta; + cos &gamma;) + i(sin &alpha; + sin &beta; + sin &gamma;) = 0 + i0 = 0.<br />
                                            From algebraic identity: If a + b + c = 0, then a³ + b³ + c³ = 3abc.<br />
                                            LHS = (e^(i&alpha;))³ + (e^(i&beta;))³ + (e^(i&gamma;))³ = e^(i3&alpha;) + e^(i3&beta;) + e^(i3&gamma;)<br />
                                            = (cos 3&alpha; + cos 3&beta; + cos 3&gamma;) + i(sin 3&alpha; + sin 3&beta; + sin 3&gamma;).<br />
                                            RHS = 3 e^(i(&alpha; + &beta; + &gamma;)) = 3 cos(&alpha; + &beta; + &gamma;) + 3i sin(&alpha; + &beta; + &gamma;).
                                        </div>
                                        <p style={{ margin: '0.4rem 0 0 0', color: '#10b981', fontWeight: 700 }}>
                                            Equating real and imaginary parts proves both (i) and (ii). Q.E.D.
                                        </p>
                                    </div>
                                </div>

                                {/* Q6 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.7 &bull; QUESTION 6
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If z = x + iy and arg((z - i)/(z + 2)) = &pi;/4, show that x² + y² + 3x - 3y + 2 = 0.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            (z - i)/(z + 2) = [x + i(y - 1)] / [(x + 2) + iy]<br />
                                            Multiply by conjugate: [(x + 2) - iy] / [(x + 2)² + y²]<br />
                                            Numerator = [x(x + 2) + y(y - 1)] + i[(y - 1)(x + 2) - xy]<br />
                                            = (x² + 2x + y² - y) + i(xy + 2y - x - 2 - xy)<br />
                                            = (x² + y² + 2x - y) + i(2y - x - 2).<br />
                                            arg(w) = &pi;/4 &rArr; tan(&pi;/4) = 1 &rArr; Im(w)/Re(w) = 1 &rArr; Im(w) = Re(w):<br />
                                            2y - x - 2 = x² + y² + 2x - y<br />
                                            &rArr; <strong>x² + y² + 3x - 3y + 2 = 0</strong>. Proved.
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

export default Section27Content;
