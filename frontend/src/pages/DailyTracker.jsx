import { useState, useEffect, useContext } from 'react'
import { ToastContext } from '../App'
import {
    CalendarDays, Zap, Search, FileText, Mail,
    MessageSquare, Flame, Trophy, Activity, Clock, Sun
} from 'lucide-react'

export default function DailyTracker() {
    const { API } = useContext(ToastContext)
    const [today, setToday] = useState(null)
    const [weekly, setWeekly] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadTracker() }, [])

    async function loadTracker() {
        try {
            const [todayRes, weeklyRes] = await Promise.all([
                fetch(`${API}/api/tracker/today`),
                fetch(`${API}/api/tracker/weekly`),
            ])
            setToday(await todayRes.json())
            setWeekly(await weeklyRes.json())
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h2><CalendarDays size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Daily Tracker</h2>
                    <p>Loading your activity...</p>
                </div>
                <div className="stats-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="stat-card">
                            <div className="loading-skeleton loading-bar short" />
                            <div className="loading-skeleton loading-bar medium" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const breakdown = today?.breakdown || {}
    const maxDayCount = weekly?.days ? Math.max(...weekly.days.map(d => d.count), 1) : 1

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2><CalendarDays size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />S.W.A.T.H.I. Activity Tracker</h2>
                    <p>See what S.W.A.T.H.I. has been doing — your hiring productivity at a glance</p>
                </div>
                {weekly?.streak > 0 && (
                    <div className="streak-badge">
                        <Flame size={20} className="streak-fire-icon" />
                        <span className="streak-count">{weekly.streak}</span>
                        <span className="streak-label">day streak</span>
                    </div>
                )}
            </div>

            {/* Today's Stats */}
            <div className="stats-grid">
                <div className="stat-card stat-card-purple">
                    <div className="stat-icon"><Zap size={28} /></div>
                    <div className="stat-value">{today?.total_actions || 0}</div>
                    <div className="stat-label">Actions Today</div>
                </div>
                <div className="stat-card stat-card-rose">
                    <div className="stat-icon"><Search size={28} /></div>
                    <div className="stat-value">{breakdown.resumes_analyzed || 0}</div>
                    <div className="stat-label">Resumes Analyzed</div>
                </div>
                <div className="stat-card stat-card-emerald">
                    <div className="stat-icon"><FileText size={28} /></div>
                    <div className="stat-value">{breakdown.jds_created || 0}</div>
                    <div className="stat-label">JDs Created</div>
                </div>
                <div className="stat-card stat-card-amber">
                    <div className="stat-icon"><Mail size={28} /></div>
                    <div className="stat-value">{breakdown.emails_sent || 0}</div>
                    <div className="stat-label">Emails Drafted</div>
                </div>
                <div className="stat-card stat-card-cyan">
                    <div className="stat-icon"><MessageSquare size={28} /></div>
                    <div className="stat-value">{breakdown.chats || 0}</div>
                    <div className="stat-label">AI Chats</div>
                </div>
            </div>

            {/* Weekly Chart + All-Time Stats */}
            <div className="tracker-grid">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Activity size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />This Week's Activity</div>
                    </div>
                    {weekly?.days?.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, paddingTop: 20 }}>
                            {weekly.days.map((day, i) => {
                                const height = (day.count / maxDayCount) * 100
                                const isToday = day.day === 'Today'
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>{day.count}</span>
                                        <div style={{
                                            width: '100%', height: `${Math.max(height, 4)}%`,
                                            background: isToday
                                                ? 'linear-gradient(to top, var(--accent-primary), var(--accent-rose))'
                                                : 'linear-gradient(to top, var(--accent-primary-bg), var(--accent-primary-light))',
                                            borderRadius: '10px 10px 0 0',
                                            transition: 'height 1s ease',
                                            border: isToday ? '2px solid var(--accent-primary)' : '1px solid var(--border)',
                                        }} />
                                        <span style={{
                                            fontSize: '0.78rem',
                                            fontWeight: isToday ? 700 : 500,
                                            color: isToday ? 'var(--accent-primary)' : 'var(--text-faint)',
                                        }}>{day.day}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 30 }}>
                            <p>No activity data yet — start using S.W.A.T.H.I.!</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Trophy size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />All-Time Impact</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
                        <div className="impact-stat">
                            <span className="impact-icon"><Search size={20} /></span>
                            <div>
                                <div className="impact-value">{weekly?.total_candidates || 0}</div>
                                <div className="impact-label">Candidates Screened</div>
                            </div>
                        </div>
                        <div className="impact-stat">
                            <span className="impact-icon"><FileText size={20} /></span>
                            <div>
                                <div className="impact-value">{weekly?.total_jds || 0}</div>
                                <div className="impact-label">Jobs Created</div>
                            </div>
                        </div>
                        <div className="impact-stat">
                            <span className="impact-icon"><Zap size={20} /></span>
                            <div>
                                <div className="impact-value">{weekly?.total_actions || 0}</div>
                                <div className="impact-label">Total Actions</div>
                            </div>
                        </div>
                        <div className="impact-stat">
                            <span className="impact-icon"><Flame size={20} /></span>
                            <div>
                                <div className="impact-value">{weekly?.streak || 0} days</div>
                                <div className="impact-label">Current Streak</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Timeline */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <div className="card-title"><Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Today's Timeline</div>
                </div>
                {today?.timeline?.length > 0 ? (
                    <div className="tracker-timeline">
                        {today.timeline.map((item, i) => (
                            <div key={item.id || i} className="timeline-item">
                                <div className="timeline-dot" />
                                <div className="timeline-content">
                                    <div className="timeline-detail">{item.details}</div>
                                    <div className="timeline-time">{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: 40 }}>
                        <div className="empty-icon"><Sun size={40} /></div>
                        <h3>No activity today yet</h3>
                        <p>Start screening, creating JDs, or chatting with S.W.A.T.H.I. to see your timeline here!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
