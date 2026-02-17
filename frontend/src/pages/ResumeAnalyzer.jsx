import { useState, useEffect, useContext, useRef } from 'react'
import { ToastContext } from '../App'
import ScoreGauge from '../components/ScoreGauge'
import StarRating from '../components/StarRating'
import {
    Search, FileUp, Rocket, Paperclip, ClipboardList,
    CheckCircle2, AlertTriangle, Trophy, XCircle,
    Mail, Phone, Briefcase, Target, Flag, X
} from 'lucide-react'

export default function ResumeAnalyzer() {
    const { addToast, API } = useContext(ToastContext)
    const [jds, setJds] = useState([])
    const [selectedJd, setSelectedJd] = useState('')
    const [files, setFiles] = useState([])
    const [analyzing, setAnalyzing] = useState(false)
    const [results, setResults] = useState([])
    const [activeResult, setActiveResult] = useState(null)
    const fileRef = useRef()
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        fetch(`${API}/api/jds`).then(r => r.json()).then(data => {
            const active = data.filter(j => j.status === 'active')
            setJds(active)
            if (active.length) setSelectedJd(active[0].id)
        })
    }, [])

    function handleDrop(e) {
        e.preventDefault()
        setDragActive(false)
        const dropped = Array.from(e.dataTransfer.files).filter(f =>
            f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.docx')
        )
        setFiles(prev => [...prev, ...dropped])
    }

    function handleFileSelect(e) {
        const selected = Array.from(e.target.files)
        setFiles(prev => [...prev, ...selected])
    }

    function removeFile(idx) {
        setFiles(prev => prev.filter((_, i) => i !== idx))
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    async function analyzeAll() {
        if (!selectedJd) return addToast('Select a JD first', 'error')
        if (!files.length) return addToast('Add at least one resume', 'error')

        setAnalyzing(true)
        setResults([])
        const newResults = []

        for (const file of files) {
            try {
                const formData = new FormData()
                formData.append('resume', file)
                formData.append('jd_id', selectedJd)

                const res = await fetch(`${API}/api/candidates/analyze`, { method: 'POST', body: formData })
                const data = await res.json()

                if (res.ok) {
                    newResults.push({ ...data, filename: file.name, success: true })
                    addToast(`${data.name} — ${data.match_score}% match`, 'success')
                } else {
                    newResults.push({ filename: file.name, success: false, error: data.detail || 'Analysis failed' })
                    addToast(`${file.name} failed`, 'error')
                }
            } catch (err) {
                newResults.push({ filename: file.name, success: false, error: err.message })
            }
            setResults([...newResults])
        }

        setAnalyzing(false)
        setFiles([])
    }

    function getRecClass(rec) {
        if (rec === 'HIGHLY RECOMMENDED') return 'rec-highly'
        if (rec === 'RECOMMENDED') return 'rec-recommended'
        if (rec === 'MAYBE') return 'rec-maybe'
        return 'rec-not'
    }

    function getScoreClass(score) {
        if (score >= 80) return 'score-high'
        if (score >= 60) return 'score-medium'
        if (score >= 40) return 'score-low'
        return 'score-very-low'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2><Search size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Resume Analyzer</h2>
                <p>Upload resumes to screen against a job description. AI does the heavy lifting!</p>
            </div>

            {/* Upload Section */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Select Job Description *</label>
                        <select className="form-select" value={selectedJd} onChange={e => setSelectedJd(e.target.value)}>
                            <option value="">Choose a JD...</option>
                            {jds.map(jd => (
                                <option key={jd.id} value={jd.id}>{jd.title} — {jd.department}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 20 }}>
                        <button
                            className="btn btn-primary"
                            onClick={analyzeAll}
                            disabled={analyzing || !files.length || !selectedJd}
                            style={{ width: '100%' }}
                        >
                            {analyzing ? <><span className="spinner" /> Analyzing {files.length} resume(s)...</> : <><Rocket size={16} /> Analyze {files.length || ''} Resume{files.length !== 1 ? 's' : ''}</>}
                        </button>
                    </div>
                </div>

                <div
                    className={`dropzone ${dragActive ? 'active' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                >
                    <div className="dropzone-icon"><FileUp size={40} /></div>
                    <h3>Drop resumes here or click to browse</h3>
                    <p>Supports PDF and DOCX files • Upload multiple at once</p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.docx"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </div>

                {files.length > 0 && (
                    <div className="file-list">
                        {files.map((f, i) => (
                            <div key={i} className="file-item">
                                <span className="file-name"><Paperclip size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{f.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className="file-size">{formatSize(f.size)}</span>
                                    <button className="btn-icon" onClick={() => removeFile(i)} title="Remove"><X size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClipboardList size={20} /> Analysis Results ({results.filter(r => r.success).length}/{results.length} successful)
                    </h3>

                    <div className="table-wrapper" style={{ marginBottom: 24 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Current Role</th>
                                    <th>Exp</th>
                                    <th>Score</th>
                                    <th>Rating</th>
                                    <th>Recommendation</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.filter(r => r.success).sort((a, b) => b.match_score - a.match_score).map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            <div>{r.name}</div>
                                            {r.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.email}</div>}
                                        </td>
                                        <td>{r.current_role || '—'}</td>
                                        <td>{r.experience_years || 0}y</td>
                                        <td><span className={`score-badge ${getScoreClass(r.match_score)}`}>{r.match_score}%</span></td>
                                        <td><StarRating rating={r.star_rating} size="0.85rem" /></td>
                                        <td><span className={`rec-badge ${getRecClass(r.recommendation)}`}>{r.recommendation}</span></td>
                                        <td><button className="btn btn-sm btn-secondary" onClick={() => setActiveResult(r)}>View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {activeResult && (
                <div className="modal-overlay" onClick={() => setActiveResult(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><ClipboardList size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />{activeResult.name}'s Analysis</h3>
                            <button className="modal-close" onClick={() => setActiveResult(null)}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                            <ScoreGauge score={activeResult.match_score} size={120} />
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{activeResult.name}</div>
                                {activeResult.email && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} />{activeResult.email}</div>}
                                {activeResult.phone && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} />{activeResult.phone}</div>}
                                <div style={{ marginTop: 8 }}><StarRating rating={activeResult.star_rating} /></div>
                                <div style={{ marginTop: 8 }}><span className={`rec-badge ${getRecClass(activeResult.recommendation)}`}>{activeResult.recommendation}</span></div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 16, border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardList size={16} /> Summary</h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{activeResult.overall_summary}</p>
                        </div>

                        <div className="detail-panel">
                            <div className="detail-section">
                                <h4><CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-emerald)' }} /> Strengths</h4>
                                <ul>{activeResult.strengths?.map((s, i) => <li key={i} style={{ borderLeftColor: 'var(--accent-emerald)' }}>{s}</li>)}</ul>
                            </div>
                            <div className="detail-section">
                                <h4><AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-amber)' }} /> Gaps</h4>
                                <ul>{activeResult.gaps?.map((g, i) => <li key={i} style={{ borderLeftColor: 'var(--accent-amber)' }}>{g}</li>)}</ul>
                            </div>
                            <div className="detail-section">
                                <h4><Trophy size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-emerald)' }} /> Matched Skills</h4>
                                <div className="tags-container">
                                    {activeResult.matched_skills?.map((s, i) => <span key={i} className="tag tag-green">{s}</span>)}
                                </div>
                            </div>
                            <div className="detail-section">
                                <h4><XCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-red)' }} /> Missing Skills</h4>
                                <div className="tags-container">
                                    {activeResult.missing_skills?.map((s, i) => <span key={i} className="tag tag-red">{s}</span>)}
                                </div>
                            </div>
                        </div>

                        {activeResult.experience_analysis && (
                            <div style={{ background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', marginTop: 16, border: '1px solid var(--border-subtle)' }}>
                                <h4 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={16} /> Experience Analysis</h4>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{activeResult.experience_analysis}</p>
                            </div>
                        )}

                        {activeResult.suggested_interview_questions?.length > 0 && (
                            <div style={{ background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', marginTop: 16, border: '1px solid var(--border-subtle)' }}>
                                <h4 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Target size={16} /> Suggested Interview Questions</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {activeResult.suggested_interview_questions.map((q, i) => <li key={i} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-cyan)' }}>{q}</li>)}
                                </ul>
                            </div>
                        )}

                        {activeResult.red_flags?.length > 0 && (
                            <div style={{ background: 'rgba(244,63,94,0.05)', padding: 16, borderRadius: 'var(--radius-md)', marginTop: 16, border: '1px solid rgba(244,63,94,0.2)' }}>
                                <h4 style={{ marginBottom: 8, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: 6 }}><Flag size={16} /> Red Flags</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {activeResult.red_flags.map((f, i) => <li key={i} style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-rose)' }}>{f}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
