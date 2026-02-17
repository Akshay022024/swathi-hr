"""
S.W.A.T.H.I. Database Models
SQLAlchemy + SQLite — zero config, maximum power
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./swathi.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    department = Column(String(100), default="Engineering")
    location = Column(String(100), default="Remote")
    employment_type = Column(String(50), default="Full-time")  # Full-time, Part-time, Contract
    experience_level = Column(String(50), default="Mid-level")  # Entry, Mid, Senior, Lead
    salary_range = Column(String(100), default="")
    description = Column(Text, nullable=False)
    requirements = Column(Text, default="")
    nice_to_have = Column(Text, default="")
    status = Column(String(20), default="active")  # active, paused, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    candidates = relationship("Candidate", back_populates="job_description", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    jd_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)

    # Extracted info
    name = Column(String(200), default="Unknown Candidate")
    email = Column(String(200), default="")
    phone = Column(String(50), default="")
    current_role = Column(String(200), default="")
    experience_years = Column(Float, default=0.0)

    # Resume data
    resume_filename = Column(String(300), nullable=False)
    resume_text = Column(Text, default="")

    # AI Analysis
    match_score = Column(Float, default=0.0)  # 0-100
    star_rating = Column(Float, default=0.0)  # 1-5 stars
    recommendation = Column(String(50), default="PENDING")  # HIGHLY RECOMMENDED, RECOMMENDED, MAYBE, NOT RECOMMENDED
    overall_summary = Column(Text, default="")
    strengths = Column(Text, default="[]")  # JSON array
    gaps = Column(Text, default="[]")  # JSON array
    matched_skills = Column(Text, default="[]")  # JSON array
    missing_skills = Column(Text, default="[]")  # JSON array
    experience_analysis = Column(Text, default="")

    # HR Management
    status = Column(String(30), default="new")  # new, shortlisted, interviewing, rejected, hired, on_hold
    hr_notes = Column(Text, default="")
    interview_date = Column(DateTime, nullable=True)
    rejection_reason = Column(String(500), default="")

    # Timestamps
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job_description = relationship("JobDescription", back_populates="candidates")


class ActivityLog(Base):
    """Track everything that happens — full audit trail for HRs"""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)  # resume_analyzed, status_changed, jd_created, etc.
    entity_type = Column(String(50), nullable=False)  # candidate, jd
    entity_id = Column(Integer, nullable=False)
    details = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailTemplate(Base):
    """Saved email templates for quick reuse"""
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    template_type = Column(String(50), nullable=False)  # rejection, interview_invite, offer, follow_up, custom
    subject = Column(String(500), default="")
    body = Column(Text, default="")
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
