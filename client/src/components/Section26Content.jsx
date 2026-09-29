import React, { useState } from 'react';
import {
    BookOpen, FileText, CheckSquare, Layers, Download, CheckCircle,
    Info, Eye, ChevronRight, HelpCircle, ArrowRight, Circle, Compass
} from 'lucide-react';

const Section26Content = ({ activeModule = 'content', onModuleChange }) => {
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
        content: '/videos/Mathematics/Chapter%202/Main%20Content/2.6/2.6_Content_Eng.pdf',
        example: '/videos/Mathematics/Chapter%202/Main%20Content/2.6/2.6_Example_Eng.pdf',
        exercise: '/videos/Mathematics/Chapter%202/Main%20Content/2.6/2.6_Exercise_Eng.pdf',
        all: '/videos/Mathematics/Chapter%202/Main%20Content/2.6/2.6_Content_Eng.pdf'
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
                        1. Geometry & Circle Definition
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
                        2. Worked Examples (2.18 - 2.21)
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
                        3. Exercise 2.6 Solutions (Q1 - Q5)
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
                            title="Section 2.6 PDF Viewer"
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
                                    2.6 Geometry and Locus of Complex Numbers
                                </h1>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Definition 2.5 of a Circle, Complex Form |z - z₀| = r, Interior and Exterior Regions, Argand Triangle Representations, and Cartesian Loci.
                                </p>
                            </div>
                            <div style={{
                                padding: '0.4rem 0.9rem', borderRadius: '999px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)'
                            }}>
                                Section 2.6 Complete Content
                            </div>
                        </div>

                        {/* PART 1: THEORY */}
                        {(selectedModule === 'content' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
                                    <Circle size={22} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 1: Theory, Circle Equation & Regions (2.6_Content_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Definition 2.5 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        DEFINITION 2.5 &bull; PAGE 74
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Circle in the Complex Plane
                                    </h3>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 0.85rem 0' }}>
                                        A circle is defined as the locus of a point which moves in a plane such that its distance from a fixed point in that plane is always a constant.
                                        The fixed point is called the <strong>centre (z₀)</strong> and the constant distance is called the <strong>radius (r)</strong> of the circle.
                                    </p>
                                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.6rem', borderLeft: '4px solid var(--primary)', fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                                        |z - z₀| = r
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                                        Here, <strong>z = x + iy</strong> is any point on the circle, <strong>z₀ = x₀ + iy₀</strong> is the fixed centre, and <strong>r &gt; 0</strong> is the real radius.
                                    </p>
                                </div>

                                {/* Regions relative to circle */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                                        Regions in the Complex Plane (Boundary, Interior & Exterior)
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.3rem', fontFamily: 'monospace' }}>
                                                |z - z₀| = r
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>On the Circle</div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                                                Points whose distance from centre z₀ is exactly equal to r. Represents the boundary curve itself.
                                            </p>
                                        </div>

                                        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem', marginBottom: '0.3rem', fontFamily: 'monospace' }}>
                                                |z - z₀| &lt; r
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>Interior Region</div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                                                Points strictly inside the circular disk. The distance from the centre is less than radius r.
                                            </p>
                                        </div>

                                        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1rem', marginBottom: '0.3rem', fontFamily: 'monospace' }}>
                                                |z - z₀| &gt; r
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>Exterior Region</div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                                                Points outside the circle. The distance from the centre is strictly greater than radius r.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Conversion to Cartesian Locus */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Converting Complex Locus to Cartesian Form
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.6', margin: '0 0 0.75rem 0' }}>
                                        To transform any relation involving complex variable <strong>z</strong> into a Cartesian (x, y) equation:
                                    </p>
                                    <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                                        <li>Substitute <strong>z = x + iy</strong>, where x, y &isin; &reals;.</li>
                                        <li>Group real and imaginary components: (x - x₀) + i(y - y₀).</li>
                                        <li>Apply the modulus formula: |(x - x₀) + i(y - y₀)| = &radic;((x - x₀)² + (y - y₀)²).</li>
                                        <li>Square both sides to eliminate the radical: <strong>(x - x₀)² + (y - y₀)² = r²</strong>, matching the standard Cartesian equation of a circle.</li>
                                    </ol>
                                </div>
                            </section>
                        )}

                        {/* PART 2: WORKED EXAMPLES */}
                        {(selectedModule === 'example' || selectedModule === 'all') && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem' }}>
                                    <CheckSquare size={22} color="#f59e0b" />
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                                        Part 2: Worked Examples 2.18 to 2.21 (2.6_Example_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Example 2.18 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.18 &bull; PAGE 75
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Argand Plane Geometry</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Given z = 3 + 2i, represent z, iz, and z + iz in one Argand plane and show they form an isosceles right triangle.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.4rem 0' }}><strong>Step 1: Determine the vertices</strong></p>
                                        <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.25rem' }}>
                                            <li>Vertex A = z = 3 + 2i</li>
                                            <li>Vertex C = iz = i(3 + 2i) = 3i + 2i² = -2 + 3i</li>
                                            <li>Vertex B = z + iz = (3 + 2i) + (-2 + 3i) = 1 + 5i</li>
                                        </ul>
                                        <p style={{ margin: '0 0 0.4rem 0' }}><strong>Step 2: Calculate lengths of the sides</strong></p>
                                        <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.25rem' }}>
                                            <li>AB² = |(z + iz) - z|² = |iz|² = |-2 + 3i|² = (-2)² + 3² = 4 + 9 = <strong>13</strong></li>
                                            <li>BC² = |iz - (z + iz)|² = |-z|² = |-3 - 2i|² = (-3)² + (-2)² = 9 + 4 = <strong>13</strong></li>
                                            <li>CA² = |z - iz|² = |(3 + 2i) - (-2 + 3i)|² = |5 - i|² = 5² + (-1)² = 25 + 1 = <strong>26</strong></li>
                                        </ul>
                                        <p style={{ margin: '0 0 0.4rem 0' }}><strong>Step 3: Verify Pythagoras Theorem & Isosceles Property</strong></p>
                                        <div style={{ color: '#10b981', fontWeight: 700 }}>
                                            Since AB² = BC² = 13 &rArr; AB = BC (Isosceles).<br />
                                            Also, AB² + BC² = 13 + 13 = 26 = CA² (Right-angled at B).<br />
                                            Hence, &Delta;ABC forms an isosceles right-angled triangle. Q.E.D.
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.19 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.19 &bull; PAGE 75
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Circle Standard Form</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Show that |3z - 5 + i| = 4 represents a circle, and find its centre and radius.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.4rem 0' }}>Factor out the coefficient 3 from the modulus:</p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.3rem 0', fontWeight: 600 }}>
                                            |3(z - (5/3 - (1/3)i))| = 4 &rArr; 3 |z - (5/3 - (1/3)i)| = 4 &rArr; |z - (5/3 - (1/3)i)| = 4/3
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0.2rem 0' }}>
                                            Comparing with the standard equation |z - z₀| = r:
                                        </p>
                                        <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                            Centre z₀ = 5/3 - (1/3)i  (i.e. Point (5/3, -1/3))<br />
                                            Radius r = 4/3
                                        </div>
                                    </div>
                                </div>

                                {/* Example 2.20 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.20 &bull; PAGE 75
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Interior Region</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Show that |z + 2 - i| &lt; 2 represents interior points of a circle, and find its centre and radius.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.4rem 0' }}>Rewrite in standard form |z - z₀| &lt; r:</p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.3rem 0', fontWeight: 600 }}>
                                            |z - (-2 + i)| &lt; 2
                                        </div>
                                        <p style={{ margin: '0.4rem 0', color: '#10b981', fontWeight: 700 }}>
                                            This is of the form |z - z₀| &lt; r. Hence it represents the interior points of the circle with Centre z₀ = -2 + i (Point (-2, 1)) and Radius r = 2.
                                        </p>
                                    </div>
                                </div>

                                {/* Example 2.21 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                            EXAMPLE 2.21 &bull; PAGE 76
                                        </span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cartesian Locus</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Obtain the Cartesian form of the locus of z in each case: (i) |z| = |z - i|, (ii) |2z - 3 - i| = 3.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.2rem 0' }}><strong>Subdivision (i): |z| = |z - i|</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.2rem 0 0.6rem 0' }}>
                                            Substitute z = x + iy &rArr; |x + iy| = |x + i(y - 1)|<br />
                                            Squaring: x² + y² = x² + (y - 1)² &rArr; x² + y² = x² + y² - 2y + 1<br />
                                            &rArr; -2y + 1 = 0 &rArr; <strong>2y - 1 = 0</strong> (A straight line parallel to the real axis).
                                        </div>
                                        <p style={{ margin: '0.6rem 0 0.2rem 0' }}><strong>Subdivision (ii): |2z - 3 - i| = 3</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.2rem 0' }}>
                                            Substitute z = x + iy &rArr; |2(x + iy) - 3 - i| = 3 &rArr; |(2x - 3) + i(2y - 1)| = 3<br />
                                            Squaring: (2x - 3)² + (2y - 1)² = 3² = 9<br />
                                            4x² - 12x + 9 + 4y² - 4y + 1 = 9<br />
                                            &rArr; <strong>4x² + 4y² - 12x - 4y + 1 = 0</strong> (Cartesian equation of a circle).
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
                                        Part 3: Exercise 2.6 Full Solutions (2.6_Exercise_Eng.pdf)
                                    </h2>
                                </div>

                                {/* Q1 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.6 &bull; QUESTION 1
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If z = x + iy and |(z - 4i)/(z + 4i)| = 1, show that the locus of z is the real axis.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <div style={{ fontFamily: 'monospace' }}>
                                            |(z - 4i)/(z + 4i)| = 1 &rArr; |z - 4i| = |z + 4i|<br />
                                            Substitute z = x + iy: |x + i(y - 4)| = |x + i(y + 4)|<br />
                                            Squaring both sides: x² + (y - 4)² = x² + (y + 4)²<br />
                                            x² + y² - 8y + 16 = x² + y² + 8y + 16<br />
                                            -8y = 8y &rArr; 16y = 0 &rArr; <strong>y = 0</strong>
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0 0', color: '#10b981', fontWeight: 700 }}>
                                            Since y = 0 is the equation of the x-axis, the locus of z is the real axis. Proved.
                                        </p>
                                    </div>
                                </div>

                                {/* Q2 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.6 &bull; QUESTION 2
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        If z = x + iy and Im((2z + 1)/(iz + 1)) = 0, show that the locus of z is 2x² + 2y² + x - 2y = 0.
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Numerator: 2(x + iy) + 1 = (2x + 1) + i(2y)</p>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Denominator: i(x + iy) + 1 = ix - y + 1 = (1 - y) + ix</p>
                                        <p style={{ margin: '0 0 0.3rem 0' }}>Multiply numerator and denominator by conjugate of denominator: (1 - y) - ix:</p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.4rem 0' }}>
                                            [(2x + 1) + i(2y)][(1 - y) - ix] / [(1 - y)² + x²]<br />
                                            Imaginary part = [2y(1 - y) - x(2x + 1)] / [(1 - y)² + x²]
                                        </div>
                                        <p style={{ margin: '0.4rem 0' }}>Given Im(...) = 0:</p>
                                        <div style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>
                                            2y - 2y² - 2x² - x = 0 &rArr; -(2x² + 2y² + x - 2y) = 0 &rArr; 2x² + 2y² + x - 2y = 0. Proved.
                                        </div>
                                    </div>
                                </div>

                                {/* Q3 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.6 &bull; QUESTION 3
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Obtain the Cartesian equation for the locus of z = x + iy in each of the following cases:
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                            <li style={{ marginBottom: '0.5rem' }}>
                                                <strong>(i) Re(iz²):</strong> iz² = i(x + iy)² = i(x² - y² + 2ixy) = -2xy + i(x² - y²).<br />
                                                Hence Re(iz²) = <strong>-2xy = 0</strong> (or xy = 0).
                                            </li>
                                            <li style={{ marginBottom: '0.5rem' }}>
                                                <strong>(ii) Im((1 - i)z + 1) = 0:</strong> (1 - i)(x + iy) + 1 = (x + y + 1) + i(y - x).<br />
                                                Imaginary part = y - x = 0 &rArr; <strong>x - y = 0</strong>.
                                            </li>
                                            <li style={{ marginBottom: '0.5rem' }}>
                                                <strong>(iii) |z + i| = |z - 1|:</strong> |x + i(y + 1)| = |(x - 1) + iy| &rArr; x² + (y + 1)² = (x - 1)² + y²<br />
                                                2y + 1 = -2x + 1 &rArr; 2x + 2y = 0 &rArr; <strong>x + y = 0</strong>.
                                            </li>
                                            <li>
                                                <strong>(iv) z̄ = z⁻¹:</strong> z̄ = 1/z &rArr; z · z̄ = 1 &rArr; |z|² = 1 &rArr; <strong>x² + y² = 1</strong> (Circle with centre (0,0) and radius 1).
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Q4 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.6 &bull; QUESTION 4
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Show that each of the following equations represents a circle, and find its centre and radius:
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                            <li style={{ marginBottom: '0.6rem' }}>
                                                <strong>(i) |z - 2 - i| = 3:</strong><br />
                                                Rewrite as |z - (2 + i)| = 3. Standard form |z - z₀| = r.<br />
                                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Centre = 2 + i (Point (2, 1)), Radius = 3.</span>
                                            </li>
                                            <li style={{ marginBottom: '0.6rem' }}>
                                                <strong>(ii) |2z + 2 - 4i| = 2:</strong><br />
                                                Divide by 2: |z + 1 - 2i| = 1 &rArr; |z - (-1 + 2i)| = 1.<br />
                                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Centre = -1 + 2i (Point (-1, 2)), Radius = 1.</span>
                                            </li>
                                            <li>
                                                <strong>(iii) |3z - 6 + 12i| = 8:</strong><br />
                                                Divide by 3: |z - 2 + 4i| = 8/3 &rArr; |z - (2 - 4i)| = 8/3.<br />
                                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Centre = 2 - 4i (Point (2, -4)), Radius = 8/3.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Q5 */}
                                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid var(--card-border)', background: 'var(--surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            EXERCISE 2.6 &bull; QUESTION 5
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                        Obtain the Cartesian equation for the locus of z = x + iy in each case:
                                    </h3>
                                    <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                                        <p style={{ margin: '0 0 0.2rem 0' }}><strong>(i) |z - 4| = 16:</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.2rem 0 0.6rem 0' }}>
                                            |(x - 4) + iy| = 16 &rArr; (x - 4)² + y² = 16² = 256<br />
                                            x² - 8x + 16 + y² = 256 &rArr; <strong>x² + y² - 8x - 240 = 0</strong> (Circle).
                                        </div>
                                        <p style={{ margin: '0.6rem 0 0.2rem 0' }}><strong>(ii) |z - 4|² - |z - 1|² = 16:</strong></p>
                                        <div style={{ fontFamily: 'monospace', margin: '0.2rem 0' }}>
                                            |z - 4|² = (x - 4)² + y² = x² - 8x + 16 + y²<br />
                                            |z - 1|² = (x - 1)² + y² = x² - 2x + 1 + y²<br />
                                            (x² - 8x + 16 + y²) - (x² - 2x + 1 + y²) = 16<br />
                                            -6x + 15 = 16 &rArr; -6x = 1 &rArr; <strong>6x + 1 = 0</strong> (A straight line parallel to the imaginary axis).
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

export default Section26Content;
