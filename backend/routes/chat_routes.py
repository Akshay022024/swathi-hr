"""
S.W.A.T.H.I. — AI Chat Routes
Conversational AI assistant for HR queries
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, JobDescription, Candidate, ActivityLog
from services.ai_service import _call_groq

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = ""


@router.post("")
def chat_with_swathi(data: ChatMessage, db: Session = Depends(get_db)):
    """Chat with S.W.A.T.H.I. AI — context-aware HR assistant"""

    # Gather live context from the database
    total_jds = db.query(JobDescription).filter(JobDescription.status == "active").count()
    total_candidates = db.query(Candidate).count()
    recent_candidates = db.query(Candidate).order_by(Candidate.analyzed_at.desc()).limit(5).all()
    shortlisted = db.query(Candidate).filter(Candidate.status == "shortlisted").count()
    hired = db.query(Candidate).filter(Candidate.status == "hired").count()

    # Build context string
    context_parts = [
        f"Current database status: {total_jds} active JDs, {total_candidates} total candidates analyzed",
        f"Pipeline: {shortlisted} shortlisted, {hired} hired",
    ]

    if recent_candidates:
        recent_info = ", ".join([
            f"{c.name} ({c.match_score}% match, status: {c.status})"
            for c in recent_candidates
        ])
        context_parts.append(f"Recent candidates: {recent_info}")

    db_context = "\n".join(context_parts)

    system_prompt = f"""You are S.W.A.T.H.I. (Smart Workforce Automation for Talent Hiring Intelligence), a warm, empowering, and brilliant AI HR assistant.

PERSONALITY:
- You're friendly, supportive, and professional
- You use encouraging language and light emojis (🌸 ✨ 💪 🎯)
- You give practical, actionable HR advice
- You're empathetic and understand HR challenges
- You celebrate wins and encourage during tough times
- Keep responses concise and helpful (2-4 paragraphs max)

YOUR CAPABILITIES:
- Resume screening & analysis
- Job description creation
- Candidate pipeline management
- Email drafting
- HR strategy advice and best practices
- Interview preparation tips
- Diversity & inclusion guidance

LIVE DATA FROM YOUR SYSTEM:
{db_context}

{f"Additional context: {data.context}" if data.context else ""}

Always respond as S.W.A.T.H.I. — never break character. If asked something outside HR, gently redirect while being helpful."""

    try:
        response = _call_groq(system_prompt, data.message, temperature=0.7, max_tokens=1000)
        
        # Log the chat interaction
        log = ActivityLog(
            action="chat_interaction",
            entity_type="chat",
            entity_id=0,
            details=f"Chat: {data.message[:100]}..."
        )
        db.add(log)
        db.commit()

        return {
            "response": response,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {
            "response": f"Oops! I had a little hiccup 🌸 Please try again! (Error: {str(e)[:100]})",
            "timestamp": datetime.utcnow().isoformat(),
        }


@router.get("/suggestions")
def get_suggestions(db: Session = Depends(get_db)):
    """Get contextual chat suggestions based on current data"""
    total_candidates = db.query(Candidate).count()
    total_jds = db.query(JobDescription).filter(JobDescription.status == "active").count()

    suggestions = [
        "💡 How can I improve my hiring process?",
        "📝 Help me write interview questions",
        "🎯 Tips for better job descriptions",
    ]

    if total_jds == 0:
        suggestions.insert(0, "📋 Help me create my first job description")
    if total_candidates > 0:
        suggestions.insert(0, "📊 Show me a summary of my pipeline")
    if total_candidates > 5:
        suggestions.insert(0, "🏆 Who are my top candidates?")

    return {"suggestions": suggestions[:5]}
