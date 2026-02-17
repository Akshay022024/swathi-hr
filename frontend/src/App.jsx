import { useState, useCallback, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import ChatBot from './components/ChatBot'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import JDManager from './pages/JDManager'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import CandidatePipeline from './pages/CandidatePipeline'
import EmailGenerator from './pages/EmailGenerator'
import DailyTracker from './pages/DailyTracker'

export const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [toasts, setToasts] = useState([])
  const [showLanding, setShowLanding] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  if (showLanding) {
    return (
      <ToastContext.Provider value={{ addToast, API }}>
        <LandingPage onEnter={() => setShowLanding(false)} />
        <Toast toasts={toasts} />
      </ToastContext.Provider>
    )
  }

  return (
    <ToastContext.Provider value={{ addToast, API }}>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jds" element={<JDManager />} />
              <Route path="/analyze" element={<ResumeAnalyzer />} />
              <Route path="/candidates" element={<CandidatePipeline />} />
              <Route path="/emails" element={<EmailGenerator />} />
              <Route path="/tracker" element={<DailyTracker />} />
            </Routes>
          </main>
        </div>
        <ChatBot />
        <Toast toasts={toasts} />
      </BrowserRouter>
    </ToastContext.Provider>
  )
}

export default App
