import {
    Sparkles, BrainCircuit, FileSearch, GitBranch,
    Mail, Star, ArrowRight, Zap
} from 'lucide-react'

export default function LandingPage({ onEnter }) {
    return (
        <div className="landing-page">
            <div className="landing-blob blob-1" />
            <div className="landing-blob blob-2" />
            <div className="landing-blob blob-3" />

            <div className="landing-badge">
                <Zap size={14} />
                <span>AI-Powered HR Platform</span>
            </div>

            <div className="logo-animated">
                <h1>S.W.A.T.H.I<span className="logo-dot">.</span></h1>
            </div>
            <p className="landing-tagline">Smart Workforce Automation for Talent Hiring Intelligence</p>
            <p className="landing-desc">
                Your AI-powered partner that makes hiring feel effortless & human.
                Screen resumes, craft job descriptions, and manage your talent pipeline — all in one beautiful space.
            </p>

            <button className="landing-cta" onClick={onEnter}>
                <span>Let's Get Started</span>
                <ArrowRight size={18} />
            </button>

            <div className="landing-features">
                <div className="landing-feature">
                    <div className="feature-icon"><BrainCircuit size={28} /></div>
                    <div className="feature-label">Smart Screening</div>
                </div>
                <div className="landing-feature">
                    <div className="feature-icon"><FileSearch size={28} /></div>
                    <div className="feature-label">AI Job Descriptions</div>
                </div>
                <div className="landing-feature">
                    <div className="feature-icon"><GitBranch size={28} /></div>
                    <div className="feature-label">Pipeline Tracking</div>
                </div>
                <div className="landing-feature">
                    <div className="feature-icon"><Mail size={28} /></div>
                    <div className="feature-label">Email Templates</div>
                </div>
                <div className="landing-feature">
                    <div className="feature-icon"><Star size={28} /></div>
                    <div className="feature-label">Star Ratings</div>
                </div>
            </div>
        </div>
    )
}
