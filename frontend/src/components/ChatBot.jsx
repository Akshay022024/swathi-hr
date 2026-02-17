import { useState, useEffect, useRef, useContext } from 'react'
import { ToastContext } from '../App'
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react'

export default function ChatBot() {
    const { API } = useContext(ToastContext)
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                text: "Hey there! I'm S.W.A.T.H.I., your AI HR companion. Ask me anything about hiring, job descriptions, candidate screening, or just chat — I'm here to help make your HR life beautiful! ✨",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }])
            loadSuggestions()
        }
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function loadSuggestions() {
        try {
            const res = await fetch(`${API}/api/chat/suggestions`)
            const data = await res.json()
            setSuggestions(data.suggestions || [])
        } catch (err) { console.error(err) }
    }

    async function sendMessage(text) {
        if (!text?.trim()) return
        const userMsg = {
            role: 'user',
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        setSuggestions([])

        try {
            const res = await fetch(`${API}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text.trim() }),
            })
            const data = await res.json()
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: data.response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "Oops — I had a little hiccup! Please try again.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }])
        } finally {
            setLoading(false)
            loadSuggestions()
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    return (
        <>
            {/* Floating Chat Bubble */}
            <button
                className={`chat-fab ${isOpen ? 'chat-fab-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Chat with S.W.A.T.H.I."
            >
                {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
                {!isOpen && <span className="chat-fab-pulse" />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chat-panel">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-avatar">
                            <Bot size={20} />
                            <span className="chat-online-dot" />
                        </div>
                        <div>
                            <div className="chat-header-name">S.W.A.T.H.I.</div>
                            <div className="chat-header-status">
                                {loading ? 'Thinking...' : 'Online — ready to help'}
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <div className="chat-msg-avatar"><Bot size={14} /></div>
                                )}
                                <div className="chat-msg-bubble">
                                    <div className="chat-msg-text">{msg.text}</div>
                                    <div className="chat-msg-time">{msg.time}</div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-msg assistant">
                                <div className="chat-msg-avatar"><Bot size={14} /></div>
                                <div className="chat-msg-bubble">
                                    <div className="chat-typing">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && !loading && (
                        <div className="chat-suggestions">
                            {suggestions.map((s, i) => (
                                <button key={i} className="chat-suggestion" onClick={() => sendMessage(s)}>
                                    <Sparkles size={12} style={{ marginRight: 4 }} />{s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="chat-input-area">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask S.W.A.T.H.I. anything..."
                            rows={1}
                        />
                        <button
                            className="chat-send"
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || loading}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
