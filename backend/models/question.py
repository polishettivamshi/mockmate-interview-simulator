from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, ForeignKey("interviews.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    question_type = Column(String(20), nullable=False)  # technical, behavioral
    question_order = Column(Integer, nullable=False)  # Order in the interview
    score = Column(Float, nullable=True)  # 0-100
    ai_feedback = Column(Text, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)  # Time taken to answer
    asked_at = Column(DateTime(timezone=True), server_default=func.now())
    answered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    interview = relationship("Interview", back_populates="questions")
    
    def __repr__(self):
        return f"<Question(id={self.id}, interview_id={self.interview_id}, type={self.question_type})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "interview_id": self.interview_id,
            "question_text": self.question_text,
            "answer_text": self.answer_text,
            "question_type": self.question_type,
            "question_order": self.question_order,
            "score": self.score,
            "ai_feedback": self.ai_feedback,
            "time_taken_seconds": self.time_taken_seconds,
            "asked_at": self.asked_at.isoformat() if self.asked_at else None,
            "answered_at": self.answered_at.isoformat() if self.answered_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def is_answered(self):
        """Check if question has been answered"""
        return self.answer_text is not None and self.answer_text.strip() != ""
    
    def get_response_time_minutes(self):
        """Get response time in minutes"""
        if self.time_taken_seconds:
            return round(self.time_taken_seconds / 60, 2)
        return 0
    
    def get_score_grade(self):
        """Get letter grade based on score"""
        if self.score is None:
            return "N/A"
        elif self.score >= 90:
            return "A"
        elif self.score >= 80:
            return "B"
        elif self.score >= 70:
            return "C"
        elif self.score >= 60:
            return "D"
        else:
            return "F"
    
    def calculate_time_taken(self):
        """Calculate time taken to answer if both timestamps exist"""
        if self.asked_at and self.answered_at:
            delta = self.answered_at - self.asked_at
            self.time_taken_seconds = int(delta.total_seconds())
            return self.time_taken_seconds
        return None
