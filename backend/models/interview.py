from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_selected = Column(String(100), nullable=False)
    custom_job_description = Column(Text, nullable=True)
    interview_type = Column(String(50), nullable=False)  # technical, behavioral, mixed
    difficulty = Column(Integer, nullable=False)  # 1-4
    duration = Column(Integer, nullable=False)  # in minutes
    input_method = Column(String(20), nullable=False)  # voice, text, both
    status = Column(String(20), default="in-progress")  # in-progress, completed, abandoned
    config = Column(JSON, nullable=True)  # Store additional configuration
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="interview", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Interview(id={self.id}, user_id={self.user_id}, role={self.role_selected}, status={self.status})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role_selected": self.role_selected,
            "custom_job_description": self.custom_job_description,
            "interview_type": self.interview_type,
            "difficulty": self.difficulty,
            "duration": self.duration,
            "input_method": self.input_method,
            "status": self.status,
            "config": self.config,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "questions_count": len(self.questions) if self.questions else 0
        }
    
    def get_duration_minutes(self):
        """Calculate actual duration of interview in minutes"""
        if self.started_at and self.completed_at:
            delta = self.completed_at - self.started_at
            return int(delta.total_seconds() / 60)
        return 0
    
    def is_active(self):
        """Check if interview is currently active"""
        return self.status == "in-progress"
    
    def can_be_resumed(self):
        """Check if interview can be resumed"""
        return self.status == "in-progress" and self.started_at is not None
