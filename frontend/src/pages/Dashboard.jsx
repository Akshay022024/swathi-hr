import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContext } from '../App'
import StarRating from '../components/StarRating'
import {
    LayoutDashboard, FileText, Users, TrendingUp,
    Clock, Award, Sparkles, ArrowRight, BarChart3,
    PieChart, Activity
} from 'lucide-react'

const thoughts = [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker", Icon: Sparkles },
    { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy", Icon: Award },
    { text: "Hire character. Train skill.", author: "Peter Schutz", Icon: TrendingUp },
    { text: "Great vision without great people is irrelevant.", author: "Jim Collins", Icon: Users },
    { text: "Culture eats strategy for breakfast.", author: "Peter Drucker", Icon: Activity },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", Icon: Sparkles },
    { text: "She believed she could, so she did.", author: "R.S. Grey", Icon: Award },
    { text: "Think like a queen. A queen is not afraid to fail.", author: "Oprah Winfrey", Icon: Sparkles },
    { text: "Empowered women empower women.", author: "Unknown", Icon: TrendingUp },
    { text: "Your company culture is the foundation of your future.", author: "Tony Hsieh", Icon: Activity },
]

export default function Dashboard() {
    const { API } = useContext(ToastContext)
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [activity, setActivity] = useState([])
    const [topCandidates, setTopCandidates] = useState([])
    const [loading, setLoading] = useState(true)

    const dayIndex = new Date().getDate() % thoughts.length
    const thought = thoughts[dayIndex]
    const ThoughtIcon = thought.Icon

    useEffect(() => { loadDashboard() }, [])

    async function loadDashboard() {
        try {
            const res = await fetch(`${API}/api/dashboard`)
            const data = await res.json()
            setStats(data.stats)
            setActivity(data.recent_activity || [])
            setTopCandidates(data.top_candidates || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h2><LayoutDashboard size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Welcome Back!</h2>
                    <p>Loading your hiring dashboard...</p>
                </div>
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card">
                            <div className="loading-skeleton loading-bar short" />
                            <div className="loading-skeleton loading-bar medium" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const pipelineData = stats?.pipeline || {}
    const scoreData = stats?.score_distribution || {}

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2><LayoutDashboard size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Welcome Back!</h2>
                <p>Here's what's happening with your hiring today</p>
            </div>

            {/* Thought of the Day */}
            <div className="thought-card">
                <div className="thought-icon"><ThoughtIcon size={32} /></div>
                <div>
                    <div className="thought-text">"{thought.text}"</div>
                    <div className="thought-author">— {thought.author}</div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card stat-card-purple" onClick={() => navigate('/jds')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon"><FileText size={28} /></div>
                    <div className="stat-value">{stats?.active_jds || 0}</div>
                    <div className="stat-label">Active Job Descriptions</div>
                </div>
                <div className="stat-card stat-card-rose" onClick={() => navigate('/candidates')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon"><Users size={28} /></div>
                    <div className="stat-value">{stats?.total_candidates || 0}</div>
                    <div className="stat-label">Total Candidates</div>
                </div>
                <div className="stat-card stat-card-emerald">
                    <div className="stat-icon"><TrendingUp size={28} /></div>
                    <div className="stat-value">{stats?.avg_score ? `${Math.round(stats.avg_score)}%` : '—'}</div>
                    <div className="stat-label">Average Match Score</div>
                </div>
                <div className="stat-card stat-card-amber">
                    <div className="stat-icon"><Award size={28} /></div>
                    <div className="stat-value">{stats?.shortlisted || 0}</div>
                    <div className="stat-label">Shortlisted</div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><BarChart3 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Pipeline Status</div>
                    </div>
                    {Object.keys(pipelineData).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Object.entries(pipelineData).map(([status, count]) => {
                                const max = Math.max(...Object.values(pipelineData))
                                const pct = max > 0 ? (count / max) * 100 : 0
                                return (
                                    <div key={status}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span className="stat-label" style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{count}</span>
                                        </div>
                                        <div style={{ height: 8, background: 'var(--bg-soft)', borderRadius: 99 }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`,
                                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-rose))',
                                                borderRadius: 99, transition: 'width 1s ease',
                                            }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <p>No pipeline data yet — start analyzing resumes!</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><PieChart size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Score Distribution</div>
                    </div>
                    {Object.keys(scoreData).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { key: 'excellent', label: 'Excellent (80%+)', color: 'var(--accent-emerald)' },
                                { key: 'good', label: 'Good (60–79%)', color: 'var(--accent-sky)' },
                                { key: 'average', label: 'Average (40–59%)', color: 'var(--accent-amber)' },
                                { key: 'below', label: 'Below Average (<40%)', color: 'var(--accent-red)' },
                            ].map(item => (
                                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                                    <span className="stat-label" style={{ flex: 1 }}>{item.label}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{scoreData[item.key] || 0}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <p>No score data yet — analyze some resumes!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity & Top Candidates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Recent Activity</div>
                    </div>
                    {activity.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {activity.slice(0, 8).map((a, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.88rem', color: 'var(--text-body)' }}>{a.details}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', whiteSpace: 'nowrap', marginLeft: 12 }}>{a.time_ago}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <p>No recent activity yet — time to start hiring!</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Award size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Top Candidates</div>
                        {topCandidates.length > 0 && (
                            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/candidates')}>
                                View All <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                    {topCandidates.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {topCandidates.slice(0, 5).map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary-bg), var(--accent-rose-bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                                        {c.name?.[0] || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                                        <StarRating rating={c.star_rating || 0} />
                                    </div>
                                    <span className={`score-badge ${c.match_score >= 80 ? 'score-high' : c.match_score >= 60 ? 'score-medium' : 'score-low'}`}>
                                        {c.match_score}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <p>No candidates analyzed yet — start screening!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
