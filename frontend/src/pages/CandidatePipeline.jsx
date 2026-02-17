import { useState, useEffect, useContext } from 'react'
import { ToastContext } from '../App'
import StarRating from '../components/StarRating'
import ScoreGauge from '../components/ScoreGauge'
import {
    Users, Download, Search as SearchIcon, Eye, Trash2,
    Building2, Mail, Phone, CheckCircle2, AlertTriangle,
    Trophy, XCircle, StickyNote, X
} from 'lucide-react'

export default function CandidatePipeline() {
    const { addToast, API } = useContext(ToastContext)
    const [candidates, setCandidates] = useState([])
    const [jds, setJds] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCandidate, setActiveCandidate] = useState(null)
    const [notesText, setNotesText] = useState('')

    // Filters
    const [filters, setFilters] = useState({
        jd_id: '', status: '', recommendation: '', search: '', sort_by: 'match_score', sort_order: 'desc',
    })

    useEffect(() => { loadJDs(); loadCandidates() }, [])
    useEffect(() => { loadCandidates() }, [filters])

    async function loadJDs() {
        try { setJds(await (await fetch(`${API}/api/jds`)).json()) } catch (err) { console.error(err) }
    }

    async function loadCandidates() {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.jd_id) params.set('jd_id', filters.jd_id)
            if (filters.status) params.set('status', filters.status)
            if (filters.recommendation) params.set('recommendation', filters.recommendation)
            if (filters.search) params.set('search', filters.search)
            params.set('sort_by', filters.sort_by)
            params.set('sort_order', filters.sort_order)

            const res = await fetch(`${API}/api/candidates?${params}`)
            setCandidates(await res.json())
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function updateStatus(candidateId, status) {
        try {
            const res = await fetch(`${API}/api/candidates/${candidateId}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
            })
            const data = await res.json()
            addToast(data.message, 'success')
            loadCandidates()
            if (activeCandidate?.id === candidateId) {
                setActiveCandidate(prev => ({ ...prev, status }))
            }
        } catch (err) { addToast('Failed to update status', 'error') }
    }

    async function saveNotes(candidateId) {
        try {
            await fetch(`${API}/api/candidates/${candidateId}/notes`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: notesText })
            })
            addToast('Notes saved!', 'success')
            loadCandidates()
        } catch (err) { addToast('Failed to save notes', 'error') }
    }

    async function deleteCandidate(id, name) {
        if (!confirm(`Remove ${name}?`)) return
        try {
            await fetch(`${API}/api/candidates/${id}`, { method: 'DELETE' })
            addToast(`${name} removed`, 'success')
            loadCandidates()
            if (activeCandidate?.id === id) setActiveCandidate(null)
        } catch (err) { addToast('Failed to delete', 'error') }
    }

    async function exportCSV() {
        try {
            const params = filters.jd_id ? `?jd_id=${filters.jd_id}` : ''
            const res = await fetch(`${API}/api/candidates/export/csv${params}`)
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'candidates_export.csv'
            a.click()
            addToast('CSV exported!', 'success')
        } catch (err) { addToast('Export failed', 'error') }
    }

    function openDetail(c) {
        setActiveCandidate(c)
        setNotesText(c.hr_notes || '')
    }

    function getScoreClass(score) {
        if (score >= 80) return 'score-high'
        if (score >= 60) return 'score-medium'
        if (score >= 40) return 'score-low'
        return 'score-very-low'
    }

    function getRecClass(rec) {
        if (rec === 'HIGHLY RECOMMENDED') return 'rec-highly'
        if (rec === 'RECOMMENDED') return 'rec-recommended'
        if (rec === 'MAYBE') return 'rec-maybe'
        return 'rec-not'
    }

    const statuses = ['new', 'shortlisted', 'interviewing', 'rejected', 'hired', 'on_hold']

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2><Users size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Candidate Pipeline</h2>
                    <p>Your complete hiring pipeline — filter, sort, and manage all screened candidates.</p>
                </div>
                <button className="btn btn-secondary" onClick={exportCSV}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-input">
                    <span className="search-icon"><SearchIcon size={16} /></span>
                    <input
                        className="form-input"
                        placeholder="Search by name, email, role..."
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                        style={{ paddingLeft: 40 }}
                    />
                </div>
                <select className="form-select" value={filters.jd_id} onChange={e => setFilters({ ...filters, jd_id: e.target.value })}>
                    <option value="">All JDs</option>
                    {jds.map(jd => <option key={jd.id} value={jd.id}>{jd.title}</option>)}
                </select>
                <select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <select className="form-select" value={filters.recommendation} onChange={e => setFilters({ ...filters, recommendation: e.target.value })}>
                    <option value="">All Recommendations</option>
                    <option value="HIGHLY RECOMMENDED">Highly Recommended</option>
                    <option value="RECOMMENDED">Recommended</option>
                    <option value="MAYBE">Maybe</option>
                    <option value="NOT RECOMMENDED">Not Recommended</option>
                </select>
                <select className="form-select" value={`${filters.sort_by}:${filters.sort_order}`} onChange={e => {
                    const [sort_by, sort_order] = e.target.value.split(':')
                    setFilters({ ...filters, sort_by, sort_order })
                }}>
                    <option value="match_score:desc">Score: High → Low</option>
                    <option value="match_score:asc">Score: Low → High</option>
                    <option value="analyzed_at:desc">Newest First</option>
                    <option value="analyzed_at:asc">Oldest First</option>
                    <option value="name:asc">Name A → Z</option>
                    <option value="star_rating:desc">Rating: High → Low</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="card">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="loading-skeleton loading-bar medium" style={{ flex: 1 }} />
                            <div className="loading-skeleton loading-bar short" style={{ width: 80 }} />
                            <div className="loading-skeleton loading-bar short" style={{ width: 60 }} />
                        </div>
                    ))}
                </div>
            ) : candidates.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><Users size={40} /></div>
                        <h3>No candidates found</h3>
                        <p>Upload and analyze resumes to build your pipeline</p>
                    </div>
                </div>
            ) : (
                <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
                        Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                    </p>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Position</th>
                                    <th>Exp</th>
                                    <th>Score</th>
                                    <th>Rating</th>
                                    <th>Recommendation</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => openDetail(c)}>
                                                {c.name}
                                            </div>
                                            {c.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</div>}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{c.jd_title}</td>
                                        <td>{c.experience_years}y</td>
                                        <td><span className={`score-badge ${getScoreClass(c.match_score)}`}>{c.match_score}%</span></td>
                                        <td><StarRating rating={c.star_rating} size="0.8rem" /></td>
                                        <td><span className={`rec-badge ${getRecClass(c.recommendation)}`}>{c.recommendation}</span></td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={c.status}
                                                onChange={e => updateStatus(c.id, e.target.value)}
                                                style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: '0.8rem', minWidth: 'auto', background: 'var(--bg-glass)' }}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn-icon" title="View details" onClick={() => openDetail(c)}><Eye size={16} /></button>
                                                <button className="btn-icon" title="Delete" onClick={() => deleteCandidate(c.id, c.name)} style={{ color: 'var(--accent-rose)' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Candidate Detail Modal */}
            {activeCandidate && (
                <div className="modal-overlay" onClick={() => setActiveCandidate(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Users size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />{activeCandidate.name}</h3>
                            <button className="modal-close" onClick={() => setActiveCandidate(null)}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                            <ScoreGauge score={activeCandidate.match_score} size={120} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{activeCandidate.name}</div>
                                {activeCandidate.current_role && <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={13} /> {activeCandidate.current_role}</div>}
                                {activeCandidate.email && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> {activeCandidate.email}</div>}
                                {activeCandidate.phone && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> {activeCandidate.phone}</div>}
                                <div style={{ marginTop: 8 }}><StarRating rating={activeCandidate.star_rating} /></div>
                                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className={`rec-badge ${getRecClass(activeCandidate.recommendation)}`}>{activeCandidate.recommendation}</span>
                                    <span className={`status-badge status-${activeCandidate.status}`}>{activeCandidate.status}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 16, border: '1px solid var(--border-subtle)' }}>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{activeCandidate.overall_summary}</p>
                        </div>

                        {/* Quick Status Change */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Quick Status Update:</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {statuses.map(s => (
                                    <button
                                        key={s}
                                        className={`btn btn-sm ${activeCandidate.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => updateStatus(activeCandidate.id, s)}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="detail-panel">
                            <div className="detail-section">
                                <h4><CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-emerald)' }} /> Strengths</h4>
                                <ul>{activeCandidate.strengths?.map((s, i) => <li key={i} style={{ borderLeftColor: 'var(--accent-emerald)' }}>{s}</li>)}</ul>
                            </div>
                            <div className="detail-section">
                                <h4><AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-amber)' }} /> Gaps</h4>
                                <ul>{activeCandidate.gaps?.map((g, i) => <li key={i} style={{ borderLeftColor: 'var(--accent-amber)' }}>{g}</li>)}</ul>
                            </div>
                            <div className="detail-section">
                                <h4><Trophy size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-emerald)' }} /> Matched Skills</h4>
                                <div className="tags-container">
                                    {activeCandidate.matched_skills?.map((s, i) => <span key={i} className="tag tag-green">{s}</span>)}
                                </div>
                            </div>
                            <div className="detail-section">
                                <h4><XCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-red)' }} /> Missing Skills</h4>
                                <div className="tags-container">
                                    {activeCandidate.missing_skills?.map((s, i) => <span key={i} className="tag tag-red">{s}</span>)}
                                </div>
                            </div>
                        </div>

                        {/* HR Notes */}
                        <div style={{ marginTop: 20, background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><StickyNote size={16} /> HR Notes</h4>
                            <textarea
                                className="form-textarea"
                                value={notesText}
                                onChange={e => setNotesText(e.target.value)}
                                placeholder="Add your notes about this candidate..."
                                style={{ minHeight: 80 }}
                            />
                            <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={() => saveNotes(activeCandidate.id)}>Save Notes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
