"""
S.W.A.T.H.I. — Dashboard Routes
Analytics, stats, and activity feed
"""

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Candidate, JobDescription, ActivityLog

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """The big picture — all the numbers that matter"""
    total_jds = db.query(JobDescription).count()
    active_jds = db.query(JobDescription).filter(JobDescription.status == "active").count()
    total_candidates = db.query(Candidate).count()

    # Status breakdown
    status_counts = {}
    for status in ["new", "shortlisted", "interviewing", "rejected", "hired", "on_hold"]:
        count = db.query(Candidate).filter(Candidate.status == status).count()
        status_counts[status] = count

    # Score stats
    avg_score = db.query(func.avg(Candidate.match_score)).scalar() or 0
    max_score = db.query(func.max(Candidate.match_score)).scalar() or 0
    min_score = db.query(func.min(Candidate.match_score)).scalar() or 0

    # Recommendation breakdown
    rec_counts = {}
    for rec in ["HIGHLY RECOMMENDED", "RECOMMENDED", "MAYBE", "NOT RECOMMENDED"]:
        count = db.query(Candidate).filter(Candidate.recommendation == rec).count()
        rec_counts[rec] = count

    # Top candidates (above 70 score)
    top_candidates_count = db.query(Candidate).filter(Candidate.match_score >= 70).count()

    # Today's activity
    from datetime import datetime, timedelta
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_analyzed = db.query(Candidate).filter(Candidate.analyzed_at >= today).count()

    # Score distribution for chart
    ranges = [
        ("0-20", 0, 20),
        ("21-40", 21, 40),
        ("41-60", 41, 60),
        ("61-80", 61, 80),
        ("81-100", 81, 100),
    ]
    score_distribution = []
    for label, lo, hi in ranges:
        count = db.query(Candidate).filter(Candidate.match_score >= lo, Candidate.match_score <= hi).count()
        score_distribution.append({"range": label, "count": count})

    return {
        "total_jds": total_jds,
        "active_jds": active_jds,
        "total_candidates": total_candidates,
        "status_counts": status_counts,
        "avg_score": round(avg_score, 1),
        "max_score": round(max_score, 1),
        "min_score": round(min_score, 1),
        "recommendation_counts": rec_counts,
        "top_candidates_count": top_candidates_count,
        "today_analyzed": today_analyzed,
        "score_distribution": score_distribution,
    }


@router.get("/recent-activity")
def get_recent_activity(limit: int = 20, db: Session = Depends(get_db)):
    """Recent activity feed — what happened?"""
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get("/top-candidates")
def get_top_candidates(limit: int = 5, db: Session = Depends(get_db)):
    """Top performing candidates across all JDs"""
    candidates = db.query(Candidate).order_by(Candidate.match_score.desc()).limit(limit).all()

    result = []
    for c in candidates:
        jd = db.query(JobDescription).filter(JobDescription.id == c.jd_id).first()
        result.append({
            "id": c.id,
            "name": c.name,
            "match_score": c.match_score,
            "star_rating": c.star_rating,
            "recommendation": c.recommendation,
            "current_role": c.current_role,
            "status": c.status,
            "jd_title": jd.title if jd else "Unknown",
        })

    return result
