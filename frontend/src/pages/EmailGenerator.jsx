import { useState, useEffect, useContext } from 'react'
import { ToastContext } from '../App'
import {
    Mail, BrainCircuit, Calendar, Heart, PartyPopper,
    Send, Pencil, ClipboardCopy, Save, Trash2, Pin,
    FolderOpen, X
} from 'lucide-react'

export default function EmailGenerator() {
    const { addToast, API } = useContext(ToastContext)
    const [candidates, setCandidates] = useState([])
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(false)
    const [generatedEmail, setGeneratedEmail] = useState(null)
    const [activeTab, setActiveTab] = useState('generate')

    const [form, setForm] = useState({
        template_type: 'interview_invite',
        candidate_id: '',
        candidate_name: '',
        job_title: '',
        extra_context: '',
    })

    useEffect(() => {
        fetch(`${API}/api/candidates`).then(r => r.json()).then(setCandidates).catch(console.error)
        loadTemplates()
    }, [])

    async function loadTemplates() {
        try { setTemplates(await (await fetch(`${API}/api/emails/templates`)).json()) } catch (err) { console.error(err) }
    }

    function handleCandidateSelect(id) {
        const c = candidates.find(c => c.id === parseInt(id))
        if (c) {
            setForm({ ...form, candidate_id: id, candidate_name: c.name, job_title: c.jd_title })
        } else {
            setForm({ ...form, candidate_id: id })
        }
    }

    async function generateEmail(e) {
        e.preventDefault()
        setLoading(true)
        setGeneratedEmail(null)
        try {
            const res = await fetch(`${API}/api/emails/generate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_type: form.template_type,
                    candidate_id: form.candidate_id ? parseInt(form.candidate_id) : null,
                    candidate_name: form.candidate_name,
                    job_title: form.job_title,
                    extra_context: form.extra_context,
                })
            })
            const data = await res.json()
            setGeneratedEmail(data)
            addToast('Email generated!', 'success')
        } catch (err) { addToast('Generation failed', 'error') }
        finally { setLoading(false) }
    }

    async function saveAsTemplate() {
        if (!generatedEmail) return
        try {
            await fetch(`${API}/api/emails/templates`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${form.template_type} - ${form.candidate_name || 'General'}`,
                    template_type: form.template_type,
                    subject: generatedEmail.subject,
                    body: generatedEmail.body,
                })
            })
            addToast('Template saved!', 'success')
            loadTemplates()
        } catch (err) { addToast('Failed to save template', 'error') }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
        addToast('Copied to clipboard!', 'info')
    }

    async function deleteTemplate(id) {
        try {
            await fetch(`${API}/api/emails/templates/${id}`, { method: 'DELETE' })
            addToast('Template deleted', 'success')
            loadTemplates()
        } catch (err) { addToast('Failed to delete', 'error') }
    }

    const emailTypes = [
        { value: 'interview_invite', label: 'Interview Invite', Icon: Calendar, desc: 'Invite for an interview' },
        { value: 'rejection', label: 'Kind Rejection', Icon: Heart, desc: 'Professional decline' },
        { value: 'offer', label: 'Offer Letter', Icon: PartyPopper, desc: 'Congratulations email' },
        { value: 'follow_up', label: 'Follow Up', Icon: Send, desc: 'Check-in email' },
        { value: 'custom', label: 'Custom', Icon: Pencil, desc: 'Write your own prompt' },
    ]

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2><Mail size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Email Generator</h2>
                <p>AI-crafted professional emails — rejection, interview invite, offer, and more. No more writer's block!</p>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
                    <BrainCircuit size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Generate
                </button>
                <button className={`tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
                    <FolderOpen size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Saved Templates ({templates.length})
                </button>
            </div>

            {activeTab === 'generate' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Form */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Configure Email</div>
                        </div>

                        <form onSubmit={generateEmail}>
                            {/* Email Type Selection */}
                            <div className="form-group">
                                <label>Email Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {emailTypes.map(type => {
                                        const TypeIcon = type.Icon
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                className={`btn ${form.template_type === type.value ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setForm({ ...form, template_type: type.value })}
                                                style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.85rem' }}
                                            >
                                                <TypeIcon size={16} style={{ marginRight: 6 }} /> {type.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Candidate (optional)</label>
                                <select className="form-select" value={form.candidate_id} onChange={e => handleCandidateSelect(e.target.value)}>
                                    <option value="">Manual entry...</option>
                                    {candidates.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} — {c.jd_title} ({c.match_score}%)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Candidate Name *</label>
                                    <input className="form-input" value={form.candidate_name} onChange={e => setForm({ ...form, candidate_name: e.target.value })} placeholder="John Doe" required />
                                </div>
                                <div className="form-group">
                                    <label>Job Title *</label>
                                    <input className="form-input" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} placeholder="Senior Developer" required />
                                </div>
                            </div>

                            {form.template_type === 'custom' && (
                                <div className="form-group">
                                    <label>Custom Instructions</label>
                                    <textarea className="form-textarea" value={form.extra_context} onChange={e => setForm({ ...form, extra_context: e.target.value })} placeholder="Describe what you want in the email..." />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                                {loading ? <><span className="spinner" /> Crafting email...</> : <><BrainCircuit size={16} /> Generate Email</>}
                            </button>
                        </form>
                    </div>

                    {/* Preview */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title"><Mail size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Preview</div>
                            {generatedEmail && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-sm btn-secondary" onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`)}>
                                        <ClipboardCopy size={14} /> Copy
                                    </button>
                                    <button className="btn btn-sm btn-success" onClick={saveAsTemplate}>
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            )}
                        </div>

                        {generatedEmail ? (
                            <div className="email-preview">
                                <div className="email-subject"><Pin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {generatedEmail.subject}</div>
                                <div className="email-body">{generatedEmail.body}</div>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <div className="empty-icon"><Mail size={40} /></div>
                                <h3>No email generated yet</h3>
                                <p>Select an email type and hit generate!</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Templates Tab */
                <div>
                    {templates.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-icon"><FolderOpen size={40} /></div>
                                <h3>No saved templates</h3>
                                <p>Generate emails and save them as templates for quick reuse</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {templates.map(t => (
                                <div key={t.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t.name}</div>
                                            <span className="tag tag-purple">{t.template_type}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn-icon" onClick={() => copyToClipboard(`Subject: ${t.subject}\n\n${t.body}`)}><ClipboardCopy size={16} /></button>
                                            <button className="btn-icon" onClick={() => deleteTemplate(t.id)} style={{ color: 'var(--accent-rose)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="email-preview" style={{ maxHeight: 200, overflow: 'hidden' }}>
                                        <div className="email-subject" style={{ fontSize: '0.9rem' }}>{t.subject}</div>
                                        <div className="email-body" style={{ fontSize: '0.85rem' }}>{t.body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
