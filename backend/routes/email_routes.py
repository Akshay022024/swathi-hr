"""
S.W.A.T.H.I. — Email Routes
AI-powered email generation & template management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, Candidate, JobDescription, EmailTemplate, ActivityLog
from services.ai_service import generate_email

router = APIRouter(prefix="/api/emails", tags=["Emails"])


class EmailGenerateRequest(BaseModel):
    template_type: str  # rejection, interview_invite, offer, follow_up, custom
    candidate_id: Optional[int] = None
    candidate_name: str = ""
    job_title: str = ""
    extra_context: str = ""

class EmailTemplateSave(BaseModel):
    name: str
    template_type: str
    subject: str
    body: str


@router.post("/generate")
def generate_email_route(data: EmailGenerateRequest, db: Session = Depends(get_db)):
    """Generate a personalized email using AI"""
    candidate_name = data.candidate_name
    job_title = data.job_title

    # If candidate_id provided, fetch details
    if data.candidate_id:
        c = db.query(Candidate).filter(Candidate.id == data.candidate_id).first()
        if c:
            candidate_name = c.name
            jd = db.query(JobDescription).filter(JobDescription.id == c.jd_id).first()
            job_title = jd.title if jd else job_title

    result = generate_email(
        template_type=data.template_type,
        candidate_name=candidate_name,
        job_title=job_title,
        extra_context=data.extra_context,
    )

    return {
        "subject": result.get("subject", ""),
        "body": result.get("body", ""),
        "template_type": data.template_type,
        "candidate_name": candidate_name,
    }


@router.post("/templates")
def save_email_template(data: EmailTemplateSave, db: Session = Depends(get_db)):
    """Save an email template for reuse"""
    template = EmailTemplate(
        name=data.name,
        template_type=data.template_type,
        subject=data.subject,
        body=data.body,
        is_ai_generated=True,
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    return {"id": template.id, "message": f"Template '{data.name}' saved!"}


@router.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    """List all saved email templates"""
    templates = db.query(EmailTemplate).order_by(EmailTemplate.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "template_type": t.template_type,
            "subject": t.subject,
            "body": t.body,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in templates
    ]


@router.delete("/templates/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete an email template"""
    t = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(t)
    db.commit()
    return {"message": "Template deleted."}
