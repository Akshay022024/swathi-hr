
import {
    BrainCircuit, FileSearch, GitBranch,
    Mail, Star, ArrowRight, Zap, Shield, Users, BarChart3, Sparkles
} from 'lucide-react'

export default function LandingPage({ onEnter }) {

    const features = [
        { Icon: BrainCircuit, label: 'AI Screening', desc: 'Smart resume analysis with deep matching', color: '#8b5cf6' },
        { Icon: FileSearch, label: 'JD Craft', desc: 'Generate professional job descriptions', color: '#ec4899' },
        { Icon: GitBranch, label: 'Pipeline', desc: 'Track candidates through every stage', color: '#0ea5e9' },
        { Icon: Mail, label: 'Emails', desc: 'AI-powered professional communication', color: '#f59e0b' },
        { Icon: Star, label: 'Ratings', desc: 'Smart scoring & recommendations', color: '#10b981' },
        { Icon: Shield, label: 'Insights', desc: 'Data-driven hiring intelligence', color: '#6366f1' },
    ]

    const stats = [
        { value: '95%', label: 'Accuracy', icon: <BarChart3 size={18} /> },
        { value: '10x', label: 'Faster', icon: <Zap size={18} /> },
        { value: '500+', label: 'Users', icon: <Users size={18} /> },
    ]

    return (
        <div className="landing-page">

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-badge fade-up" style={{ animationDelay: '0.1s' }}>
                    <Sparkles size={14} />
                    <span>AI-Powered HR Platform</span>
                </div>

                <div className="logo-animated fade-up" style={{ animationDelay: '0.2s' }}>
                    <h1>S.W.A.T.H.I<span className="logo-dot">.</span></h1>
                </div>

                <p className="landing-tagline fade-up" style={{ animationDelay: '0.3s' }}>
                    Smart Workforce Automation for<br />Talent Hiring Intelligence
                </p>

                <p className="landing-desc fade-up" style={{ animationDelay: '0.4s' }}>
                    Your AI-powered partner that makes hiring feel effortless & human.
                    Screen resumes, craft job descriptions, and manage your talent pipeline — all in one beautiful space.
                </p>

                <button className="landing-cta fade-up" onClick={onEnter} style={{ animationDelay: '0.5s' }}>
                    <span>Let's Get Started</span>
                    <ArrowRight size={18} />
                </button>

                {/* Mini Stats */}
                <div className="landing-stats fade-up" style={{ animationDelay: '0.6s' }}>
                    {stats.map((s, i) => (
                        <div key={i} className="landing-stat">
                            {s.icon}
                            <span className="stat-num">{s.value}</span>
                            <span className="stat-lbl">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="landing-features-section fade-up" style={{ animationDelay: '0.7s' }}>
                <h3 className="features-heading">
                    <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                    Everything you need to hire smarter
                </h3>
                <div className="landing-features-grid">
                    {features.map((f, i) => {
                        const FeatureIcon = f.Icon
                        return (
                            <div key={i} className="landing-feature-card" style={{ animationDelay: `${0.8 + i * 0.08}s` }}>
                                <div className="feature-card-icon" style={{ background: `${f.color}15`, color: f.color }}>
                                    <FeatureIcon size={24} />
                                </div>
                                <div className="feature-card-text">
                                    <h4>{f.label}</h4>
                                    <p>{f.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>


        </div>
    )
}
