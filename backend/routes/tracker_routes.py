"""
S.W.A.T.H.I. — Daily Activity Tracker Routes
Track what SWATHI does daily for productivity insights
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db, ActivityLog, Candidate, JobDescription

router = APIRouter(prefix="/api/tracker", tags=["Daily Tracker"])


@router.get("/today")
def get_today_summary(db: Session = Depends(get_db)):
    """What S.W.A.T.H.I. did today"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    today_activities = db.query(ActivityLog).filter(
        ActivityLog.created_at >= today_start
    ).order_by(ActivityLog.created_at.desc()).all()

    # Count by type
    resumes_analyzed = sum(1 for a in today_activities if 'analyzed' in a.action.lower() or 'resume' in a.action.lower())
    jds_created = sum(1 for a in today_activities if 'jd_created' in a.action.lower() or 'jd_generated' in a.action.lower() or 'jd_uploaded' in a.action.lower())
    emails_sent = sum(1 for a in today_activities if 'email' in a.action.lower())
    status_updates = sum(1 for a in today_activities if 'status' in a.action.lower())
    chats = sum(1 for a in today_activities if 'chat' in a.action.lower())

    return {
        "date": today_start.strftime("%Y-%m-%d"),
        "total_actions": len(today_activities),
        "breakdown": {
            "resumes_analyzed": resumes_analyzed,
            "jds_created": jds_created,
            "emails_sent": emails_sent,
            "status_updates": status_updates,
            "chats": chats,
        },
        "timeline": [
            {
                "id": a.id,
                "action": a.action,
                "details": a.details,
                "time": a.created_at.strftime("%I:%M %p") if a.created_at else "",
            }
            for a in today_activities
        ]
    }


@router.get("/weekly")
def get_weekly_summary(db: Session = Depends(get_db)):
    """Weekly productivity summary"""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week = []

    for i in range(7):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        count = db.query(ActivityLog).filter(
            ActivityLog.created_at >= day_start,
            ActivityLog.created_at < day_end
        ).count()

        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_label = day_names[day_start.weekday()]
        if i == 0:
            day_label = "Today"
        elif i == 1:
            day_label = "Yesterday"

        week.append({
            "day": day_label,
            "date": day_start.strftime("%Y-%m-%d"),
            "count": count,
        })

    week.reverse()

    # Calculate streak
    streak = 0
    for i in range(30):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count = db.query(ActivityLog).filter(
            ActivityLog.created_at >= day_start,
            ActivityLog.created_at < day_end
        ).count()
        if count > 0:
            streak += 1
        else:
            break

    # Total stats
    total_ever = db.query(ActivityLog).count()
    total_candidates_ever = db.query(Candidate).count()
    total_jds_ever = db.query(JobDescription).count()

    return {
        "days": week,
        "streak": streak,
        "total_actions": total_ever,
        "total_candidates": total_candidates_ever,
        "total_jds": total_jds_ever,
    }
