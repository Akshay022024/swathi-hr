"""
S.W.A.T.H.I. — JD Management Routes
Create, Read, Update, Delete + AI Generation + File Upload
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import tempfile

from database import get_db, JobDescription, Candidate, ActivityLog
from services.ai_service import generate_jd
from services.file_service import extract_text

router = APIRouter(prefix="/api/jds", tags=["Job Descriptions"])


# ── Pydantic Models ──────────────────────────────────────────

class JDCreate(BaseModel):
    title: str
    department: str = "Engineering"
    location: str = "Remote"
    employment_type: str = "Full-time"
    experience_level: str = "Mid-level"
    salary_range: str = ""
    description: str
    requirements: str = ""
    nice_to_have: str = ""

class JDUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    nice_to_have: Optional[str] = None
    status: Optional[str] = None

class JDGenerate(BaseModel):
    title: str
    department: str = "Engineering"
    brief: str
    experience_level: str = "Mid-level"


# ── Routes ───────────────────────────────────────────────────

@router.get("")
def list_jds(status: Optional[str] = None, db: Session = Depends(get_db)):
    """List all JDs with candidate counts"""
    query = db.query(JobDescription)
    if status:
        query = query.filter(JobDescription.status == status)
    jds = query.order_by(JobDescription.created_at.desc()).all()

    result = []
    for jd in jds:
        candidate_count = db.query(Candidate).filter(Candidate.jd_id == jd.id).count()
        shortlisted = db.query(Candidate).filter(Candidate.jd_id == jd.id, Candidate.status == "shortlisted").count()
        avg_score = db.query(Candidate).filter(Candidate.jd_id == jd.id).with_entities(
            db.query(Candidate).filter(Candidate.jd_id == jd.id).with_entities(Candidate.match_score)
        )

        # Calculate average score properly
        candidates = db.query(Candidate).filter(Candidate.jd_id == jd.id).all()
        avg = sum(c.match_score for c in candidates) / len(candidates) if candidates else 0

        result.append({
            "id": jd.id,
            "title": jd.title,
            "department": jd.department,
            "location": jd.location,
            "employment_type": jd.employment_type,
            "experience_level": jd.experience_level,
            "salary_range": jd.salary_range,
            "description": jd.description,
            "requirements": jd.requirements,
            "nice_to_have": jd.nice_to_have,
            "status": jd.status,
            "created_at": jd.created_at.isoformat() if jd.created_at else None,
            "candidate_count": candidate_count,
            "shortlisted_count": shortlisted,
            "avg_score": round(avg, 1),
        })

    return result


@router.get("/{jd_id}")
def get_jd(jd_id: int, db: Session = Depends(get_db)):
    """Get single JD with full details"""
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")

    candidates = db.query(Candidate).filter(Candidate.jd_id == jd.id).all()
    avg = sum(c.match_score for c in candidates) / len(candidates) if candidates else 0

    return {
        "id": jd.id,
        "title": jd.title,
        "department": jd.department,
        "location": jd.location,
        "employment_type": jd.employment_type,
        "experience_level": jd.experience_level,
        "salary_range": jd.salary_range,
        "description": jd.description,
        "requirements": jd.requirements,
        "nice_to_have": jd.nice_to_have,
        "status": jd.status,
        "created_at": jd.created_at.isoformat() if jd.created_at else None,
        "candidate_count": len(candidates),
        "avg_score": round(avg, 1),
    }


@router.post("")
def create_jd(jd_data: JDCreate, db: Session = Depends(get_db)):
    """Create a new JD manually"""
    jd = JobDescription(**jd_data.model_dump())
    db.add(jd)
    db.commit()
    db.refresh(jd)

    # Log activity
    log = ActivityLog(action="jd_created", entity_type="jd", entity_id=jd.id, details=f"Created JD: {jd.title}")
    db.add(log)
    db.commit()

    return {"id": jd.id, "message": f"JD '{jd.title}' created successfully!"}


@router.post("/generate")
def generate_jd_with_ai(data: JDGenerate, db: Session = Depends(get_db)):
    """Generate a JD using AI and save it"""
    result = generate_jd(data.title, data.department, data.brief, data.experience_level)

    jd = JobDescription(
        title=result.get("title", data.title),
        department=data.department,
        experience_level=data.experience_level,
        description=result.get("description", ""),
        requirements=result.get("requirements", ""),
        nice_to_have=result.get("nice_to_have", ""),
        salary_range=result.get("salary_suggestion", ""),
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    log = ActivityLog(action="jd_generated", entity_type="jd", entity_id=jd.id, details=f"AI-generated JD: {jd.title}")
    db.add(log)
    db.commit()

    return {
        "id": jd.id,
        "message": f"AI-generated JD '{jd.title}' created!",
        "jd": {
            "id": jd.id,
            "title": jd.title,
            "description": jd.description,
            "requirements": jd.requirements,
            "nice_to_have": jd.nice_to_have,
            "salary_range": jd.salary_range,
        },
    }


@router.put("/{jd_id}")
def update_jd(jd_id: int, data: JDUpdate, db: Session = Depends(get_db)):
    """Update existing JD"""
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(jd, key, value)
    jd.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(jd)

    log = ActivityLog(action="jd_updated", entity_type="jd", entity_id=jd.id, details=f"Updated JD: {jd.title}")
    db.add(log)
    db.commit()

    return {"message": f"JD '{jd.title}' updated!", "id": jd.id}


@router.post("/upload")
async def upload_jd_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a JD file (PDF/DOCX/TXT) and create a JD from its content"""
    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in ['.pdf', '.docx', '.txt']):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported")

    content = await file.read()

    # Extract text based on file type
    if filename.endswith('.txt'):
        text = content.decode('utf-8', errors='ignore')
    else:
        text = extract_text(file.filename, content)

    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    # Use filename (without extension) as title
    title = os.path.splitext(file.filename)[0].replace('_', ' ').replace('-', ' ').title()

    jd = JobDescription(
        title=title,
        description=text.strip(),
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    log = ActivityLog(action="jd_uploaded", entity_type="jd", entity_id=jd.id, details=f"Uploaded JD from file: {file.filename}")
    db.add(log)
    db.commit()

    return {"id": jd.id, "message": f"JD '{title}' created from uploaded file!"}


@router.delete("/{jd_id}")
def delete_jd(jd_id: int, db: Session = Depends(get_db)):
    """Delete JD and all its candidates"""
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")

    title = jd.title
    db.delete(jd)
    db.commit()

    log = ActivityLog(action="jd_deleted", entity_type="jd", entity_id=jd_id, details=f"Deleted JD: {title}")
    db.add(log)
    db.commit()

    return {"message": f"JD '{title}' and all its candidates deleted."}
