"""
S.W.A.T.H.I. — Candidate Routes
Resume analysis, bulk upload, pipeline management
"""

import json
import os
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database import get_db, Candidate, JobDescription, ActivityLog
from services.ai_service import analyze_resume, compare_candidates
from services.file_service import extract_text

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])


# ── Pydantic Models ──────────────────────────────────────────

class StatusUpdate(BaseModel):
    status: str  # new, shortlisted, interviewing, rejected, hired, on_hold

class NotesUpdate(BaseModel):
    notes: str

class CompareRequest(BaseModel):
    candidate_ids: List[int]


# ── Routes ───────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_single_resume(
    resume: UploadFile = File(...),
    jd_id: int = Form(...),
    db: Session = Depends(get_db),
):
    """Upload and analyze a single resume against a JD"""
    # Validate JD exists
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")

    # Read file
    file_bytes = await resume.read()
    filename = resume.filename or "unknown.pdf"

    # Extract text
    try:
        resume_text = extract_text(filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume")

    # Build JD text
    jd_text = f"{jd.title}\n\n{jd.description}\n\nRequirements:\n{jd.requirements}\n\nNice to have:\n{jd.nice_to_have}"

    # AI analysis
    analysis = analyze_resume(resume_text, jd_text)

    # Save candidate
    candidate = Candidate(
        jd_id=jd_id,
        name=analysis.get("candidate_name", "Unknown"),
        email=analysis.get("candidate_email", ""),
        phone=analysis.get("candidate_phone", ""),
        current_role=analysis.get("current_role", ""),
        experience_years=analysis.get("experience_years", 0),
        resume_filename=filename,
        resume_text=resume_text[:5000],  # Store first 5000 chars
        match_score=analysis.get("overall_match_score", 0),
        star_rating=analysis.get("star_rating", 1.0),
        recommendation=analysis.get("recommendation", "PENDING"),
        overall_summary=analysis.get("overall_summary", ""),
        strengths=json.dumps(analysis.get("strengths", [])),
        gaps=json.dumps(analysis.get("gaps", [])),
        matched_skills=json.dumps(analysis.get("matched_skills", [])),
        missing_skills=json.dumps(analysis.get("missing_skills", [])),
        experience_analysis=analysis.get("experience_analysis", ""),
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Log activity
    log = ActivityLog(
        action="resume_analyzed",
        entity_type="candidate",
        entity_id=candidate.id,
        details=f"Analyzed {candidate.name} for {jd.title} — Score: {candidate.match_score}%",
    )
    db.add(log)
    db.commit()

    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "current_role": candidate.current_role,
        "experience_years": candidate.experience_years,
        "match_score": candidate.match_score,
        "star_rating": candidate.star_rating,
        "recommendation": candidate.recommendation,
        "overall_summary": candidate.overall_summary,
        "strengths": analysis.get("strengths", []),
        "gaps": analysis.get("gaps", []),
        "matched_skills": analysis.get("matched_skills", []),
        "missing_skills": analysis.get("missing_skills", []),
        "experience_analysis": candidate.experience_analysis,
        "culture_fit_notes": analysis.get("culture_fit_notes", ""),
        "red_flags": analysis.get("red_flags", []),
        "suggested_interview_questions": analysis.get("suggested_interview_questions", []),
        "jd_title": jd.title,
    }


@router.post("/bulk-analyze")
async def bulk_analyze_resumes(
    resumes: List[UploadFile] = File(...),
    jd_id: int = Form(...),
    db: Session = Depends(get_db),
):
    """Upload and analyze multiple resumes at once — POWER MOVE 💪"""
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")

    jd_text = f"{jd.title}\n\n{jd.description}\n\nRequirements:\n{jd.requirements}\n\nNice to have:\n{jd.nice_to_have}"

    results = []
    errors = []

    for resume_file in resumes:
        try:
            file_bytes = await resume_file.read()
            filename = resume_file.filename or "unknown.pdf"
            resume_text = extract_text(filename, file_bytes)

            if not resume_text:
                errors.append({"file": filename, "error": "Could not extract text"})
                continue

            analysis = analyze_resume(resume_text, jd_text)

            candidate = Candidate(
                jd_id=jd_id,
                name=analysis.get("candidate_name", "Unknown"),
                email=analysis.get("candidate_email", ""),
                phone=analysis.get("candidate_phone", ""),
                current_role=analysis.get("current_role", ""),
                experience_years=analysis.get("experience_years", 0),
                resume_filename=filename,
                resume_text=resume_text[:5000],
                match_score=analysis.get("overall_match_score", 0),
                star_rating=analysis.get("star_rating", 1.0),
                recommendation=analysis.get("recommendation", "PENDING"),
                overall_summary=analysis.get("overall_summary", ""),
                strengths=json.dumps(analysis.get("strengths", [])),
                gaps=json.dumps(analysis.get("gaps", [])),
                matched_skills=json.dumps(analysis.get("matched_skills", [])),
                missing_skills=json.dumps(analysis.get("missing_skills", [])),
                experience_analysis=analysis.get("experience_analysis", ""),
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            log = ActivityLog(
                action="resume_analyzed",
                entity_type="candidate",
                entity_id=candidate.id,
                details=f"Bulk analyzed {candidate.name} for {jd.title} — Score: {candidate.match_score}%",
            )
            db.add(log)
            db.commit()

            results.append({
                "id": candidate.id,
                "name": candidate.name,
                "match_score": candidate.match_score,
                "star_rating": candidate.star_rating,
                "recommendation": candidate.recommendation,
                "filename": filename,
            })

        except Exception as e:
            errors.append({"file": resume_file.filename, "error": str(e)})

    return {
        "processed": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }


@router.get("")
def list_candidates(
    jd_id: Optional[int] = None,
    status: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    recommendation: Optional[str] = None,
    sort_by: str = "analyzed_at",
    sort_order: str = "desc",
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List candidates with powerful filters — the HR command center"""
    query = db.query(Candidate)

    if jd_id:
        query = query.filter(Candidate.jd_id == jd_id)
    if status:
        query = query.filter(Candidate.status == status)
    if min_score is not None:
        query = query.filter(Candidate.match_score >= min_score)
    if max_score is not None:
        query = query.filter(Candidate.match_score <= max_score)
    if recommendation:
        query = query.filter(Candidate.recommendation == recommendation)
    if search:
        query = query.filter(
            Candidate.name.ilike(f"%{search}%")
            | Candidate.email.ilike(f"%{search}%")
            | Candidate.current_role.ilike(f"%{search}%")
        )

    # Sorting
    sort_column = getattr(Candidate, sort_by, Candidate.analyzed_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    candidates = query.all()

    result = []
    for c in candidates:
        jd = db.query(JobDescription).filter(JobDescription.id == c.jd_id).first()
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "current_role": c.current_role,
            "experience_years": c.experience_years,
            "resume_filename": c.resume_filename,
            "match_score": c.match_score,
            "star_rating": c.star_rating,
            "recommendation": c.recommendation,
            "overall_summary": c.overall_summary,
            "strengths": json.loads(c.strengths) if c.strengths else [],
            "gaps": json.loads(c.gaps) if c.gaps else [],
            "matched_skills": json.loads(c.matched_skills) if c.matched_skills else [],
            "missing_skills": json.loads(c.missing_skills) if c.missing_skills else [],
            "experience_analysis": c.experience_analysis,
            "status": c.status,
            "hr_notes": c.hr_notes,
            "analyzed_at": c.analyzed_at.isoformat() if c.analyzed_at else None,
            "jd_id": c.jd_id,
            "jd_title": jd.title if jd else "Unknown",
        })

    return result


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Get full candidate details"""
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    jd = db.query(JobDescription).filter(JobDescription.id == c.jd_id).first()

    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "current_role": c.current_role,
        "experience_years": c.experience_years,
        "resume_filename": c.resume_filename,
        "match_score": c.match_score,
        "star_rating": c.star_rating,
        "recommendation": c.recommendation,
        "overall_summary": c.overall_summary,
        "strengths": json.loads(c.strengths) if c.strengths else [],
        "gaps": json.loads(c.gaps) if c.gaps else [],
        "matched_skills": json.loads(c.matched_skills) if c.matched_skills else [],
        "missing_skills": json.loads(c.missing_skills) if c.missing_skills else [],
        "experience_analysis": c.experience_analysis,
        "status": c.status,
        "hr_notes": c.hr_notes,
        "analyzed_at": c.analyzed_at.isoformat() if c.analyzed_at else None,
        "jd_id": c.jd_id,
        "jd_title": jd.title if jd else "Unknown",
    }


@router.put("/{candidate_id}/status")
def update_candidate_status(candidate_id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    """Update candidate pipeline status — the most used button in HR life"""
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    old_status = c.status
    c.status = data.status
    c.updated_at = datetime.utcnow()
    db.commit()

    log = ActivityLog(
        action="status_changed",
        entity_type="candidate",
        entity_id=c.id,
        details=f"{c.name}: {old_status} → {data.status}",
    )
    db.add(log)
    db.commit()

    return {"message": f"{c.name} status updated to '{data.status}'", "id": c.id}


@router.put("/{candidate_id}/notes")
def update_candidate_notes(candidate_id: int, data: NotesUpdate, db: Session = Depends(get_db)):
    """Add HR notes to a candidate"""
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    c.hr_notes = data.notes
    c.updated_at = datetime.utcnow()
    db.commit()

    return {"message": f"Notes updated for {c.name}", "id": c.id}


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Remove a candidate"""
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    name = c.name
    db.delete(c)
    db.commit()

    return {"message": f"Candidate '{name}' removed."}


@router.post("/compare")
def compare_candidates_route(data: CompareRequest, db: Session = Depends(get_db)):
    """Compare multiple candidates side-by-side — who gets the call?"""
    candidates = db.query(Candidate).filter(Candidate.id.in_(data.candidate_ids)).all()
    if len(candidates) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 candidates to compare")

    # Get JD
    jd = db.query(JobDescription).filter(JobDescription.id == candidates[0].jd_id).first()
    jd_text = f"{jd.title}\n\n{jd.description}" if jd else "No JD available"

    candidates_data = []
    for c in candidates:
        candidates_data.append({
            "name": c.name,
            "match_score": c.match_score,
            "strengths": json.loads(c.strengths) if c.strengths else [],
            "gaps": json.loads(c.gaps) if c.gaps else [],
            "experience_years": c.experience_years,
        })

    result = compare_candidates(candidates_data, jd_text)
    return result


@router.get("/export/csv")
def export_candidates_csv(jd_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Export candidates to CSV — for those who love spreadsheets"""
    query = db.query(Candidate)
    if jd_id:
        query = query.filter(Candidate.jd_id == jd_id)

    candidates = query.order_by(Candidate.match_score.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Name", "Email", "Phone", "Current Role", "Experience (Years)",
        "Match Score", "Star Rating", "Recommendation", "Status",
        "Resume File", "Analyzed At", "HR Notes"
    ])

    for c in candidates:
        jd = db.query(JobDescription).filter(JobDescription.id == c.jd_id).first()
        writer.writerow([
            c.name, c.email, c.phone, c.current_role, c.experience_years,
            c.match_score, c.star_rating, c.recommendation, c.status,
            c.resume_filename, c.analyzed_at.isoformat() if c.analyzed_at else "",
            c.hr_notes,
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=candidates_export.csv"},
    )
