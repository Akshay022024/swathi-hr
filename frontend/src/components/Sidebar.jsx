import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard, FileText, Search, Users, Mail,
    CalendarDays, Sparkles, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/jds', icon: FileText, label: 'Job Descriptions' },
    { path: '/analyze', icon: Search, label: 'Resume Analyzer' },
    { path: '/candidates', icon: Users, label: 'Candidate Pipeline' },
    { path: '/emails', icon: Mail, label: 'Email Generator' },
    { path: '/tracker', icon: CalendarDays, label: 'Daily Tracker' },
]

const dailyQuotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Hire character. Train skill.", author: "Peter Schutz" },
    { text: "Your company culture is the foundation of your future.", author: "Tony Hsieh" },
    { text: "Great vision without great people is irrelevant.", author: "Jim Collins" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "People are not your most important asset. The right people are.", author: "Jim Collins" },
    { text: "Culture eats strategy for breakfast.", author: "Peter Drucker" },
    { text: "Every great dream begins with a dreamer.", author: "Harriet Tubman" },
    { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "You don't build a business — you build people, and then people build the business.", author: "Zig Ziglar" },
    { text: "The strength of the team is each individual member.", author: "Phil Jackson" },
    { text: "Talent wins games, but teamwork wins championships.", author: "Michael Jordan" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "She believed she could, so she did.", author: "R.S. Grey" },
    { text: "A woman with a voice is, by definition, a strong woman.", author: "Melinda Gates" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Well-behaved women seldom make history.", author: "Laurel Thatcher Ulrich" },
    { text: "There is no limit to what we, as women, can accomplish.", author: "Michelle Obama" },
    { text: "You are enough just as you are.", author: "Meghan Markle" },
    { text: "Life is tough darling, but so are you.", author: "Stephanie Bennett-Henry" },
    { text: "Think like a queen. A queen is not afraid to fail.", author: "Oprah Winfrey" },
    { text: "Nothing is impossible. The word itself says 'I'm possible!'", author: "Audrey Hepburn" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Do what you feel in your heart to be right — for you'll be criticized anyway.", author: "Eleanor Roosevelt" },
    { text: "A bird doesn't sing because it has an answer, it sings because it has a song.", author: "Maya Angelou" },
    { text: "Empowered women empower women.", author: "Unknown" },
    { text: "Your time is limited. Don't waste it living someone else's life.", author: "Steve Jobs" },
]

export default function Sidebar({ isOpen, onToggle }) {
    const location = useLocation()
    const [quote, setQuote] = useState(dailyQuotes[0])

    useEffect(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
        setQuote(dailyQuotes[dayOfYear % dailyQuotes.length])
    }, [])

    return (
        <>
            {/* Mobile hamburger */}
            <button className="mobile-menu-btn" onClick={onToggle}>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-brand">
                    <h1>S.W.A.T.H.I.</h1>
                    <p>Talent Hiring Intelligence</p>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => {
                        const Icon = item.icon
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={onToggle}
                            >
                                <span className="icon"><Icon size={18} /></span>
                                <span>{item.label}</span>
                                {location.pathname === item.path && <ChevronRight size={14} className="nav-arrow" />}
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="sidebar-quote">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Sparkles size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <p>"{quote.text}"</p>
                            <div className="quote-author">— {quote.author}</div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <p><Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Making HR lives beautiful</p>
                </div>
            </aside>
        </>
    )
}
