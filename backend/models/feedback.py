from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, ForeignKey("interviews.id"), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0-100
    technical_score = Column(Float, nullable=False)  # 0-100
    communication_score = Column(Float, nullable=False)  # 0-100
    confidence_score = Column(Float, nullable=False)  # 0-100
    strengths = Column(JSON, nullable=True)  # List of strengths
    improvements = Column(JSON, nullable=True)  # List of improvement areas
    detailed_feedback = Column(Text, nullable=True)  # Comprehensive feedback
    suggestions = Column(Text, nullable=True)  # Specific suggestions
    question_analysis = Column(JSON, nullable=True)  # Per-question analysis
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    interview = relationship("Interview", back_populates="feedback")
    
    def __repr__(self):
        return f"<Feedback(id={self.id}, interview_id={self.interview_id}, overall_score={self.overall_score})>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "interview_id": self.interview_id,
            "overall_score": self.overall_score,
            "technical_score": self.technical_score,
            "communication_score": self.communication_score,
            "confidence_score": self.confidence_score,
            "strengths": self.strengths or [],
            "improvements": self.improvements or [],
            "detailed_feedback": self.detailed_feedback,
            "suggestions": self.suggestions,
            "question_analysis": self.question_analysis or [],
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_overall_grade(self):
        """Get letter grade based on overall score"""
        if self.overall_score >= 90:
            return "A"
        elif self.overall_score >= 80:
            return "B"
        elif self.overall_score >= 70:
            return "C"
        elif self.overall_score >= 60:
            return "D"
        else:
            return "F"
    
    def get_performance_level(self):
        """Get performance level description"""
        if self.overall_score >= 90:
            return "Excellent"
        elif self.overall_score >= 80:
            return "Good"
        elif self.overall_score >= 70:
            return "Average"
        elif self.overall_score >= 60:
            return "Below Average"
        else:
            return "Needs Improvement"
    
    def get_score_breakdown(self):
        """Get detailed score breakdown"""
        return {
            "overall": {
                "score": self.overall_score,
                "grade": self.get_overall_grade(),
                "level": self.get_performance_level()
            },
            "technical": {
                "score": self.technical_score,
                "percentage": round((self.technical_score / 100) * 100, 1)
            },
            "communication": {
                "score": self.communication_score,
                "percentage": round((self.communication_score / 100) * 100, 1)
            },
            "confidence": {
                "score": self.confidence_score,
                "percentage": round((self.confidence_score / 100) * 100, 1)
            }
        }
    
    def add_strength(self, strength: str):
        """Add a strength to the feedback"""
        if self.strengths is None:
            self.strengths = []
        if strength not in self.strengths:
            self.strengths.append(strength)
    
    def add_improvement(self, improvement: str):
        """Add an improvement area to the feedback"""
        if self.improvements is None:
            self.improvements = []
        if improvement not in self.improvements:
            self.improvements.append(improvement)
    
    def add_question_analysis(self, question_id: str, analysis: dict):
        """Add analysis for a specific question"""
        if self.question_analysis is None:
            self.question_analysis = []
        
        # Remove existing analysis for this question
        self.question_analysis = [
            qa for qa in self.question_analysis 
            if qa.get("question_id") != question_id
        ]
        
        # Add new analysis
        analysis["question_id"] = question_id
        self.question_analysis.append(analysis)
