from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

from database import get_db
from models.user import User
from models.interview import Interview
from models.question import Question
from models.feedback import Feedback
from utils.auth import get_current_user
from services.ai_service import evaluate_answer, generate_comprehensive_feedback

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class FeedbackResponse(BaseModel):
    id: str
    interview_id: str
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    strengths: List[str]
    improvements: List[str]
    detailed_feedback: str
    suggestions: Optional[str]
    question_analysis: List[Dict[str, Any]]
    generated_at: Optional[str]

class QuestionAnalysis(BaseModel):
    question_id: str
    question: str
    answer: str
    score: float
    feedback: str

@router.get("/{interview_id}", response_model=FeedbackResponse)
async def get_feedback(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feedback for a completed interview"""
    try:
        # Verify interview exists and belongs to user
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )
        
        # Check if feedback already exists
        feedback = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
        
        if not feedback:
            # Generate feedback if it doesn't exist
            feedback = await generate_feedback_for_interview(interview, db)
        
        # Prepare question analysis
        questions = db.query(Question).filter(
            Question.interview_id == interview_id
        ).order_by(Question.question_order).all()
        
        question_analysis = []
        for question in questions:
            if question.is_answered():
                question_analysis.append({
                    "question_id": question.id,
                    "question": question.question_text,
                    "answer": question.answer_text,
                    "score": question.score or 0,
                    "feedback": question.ai_feedback or "No specific feedback available",
                    "type": question.question_type,
                    "time_taken": question.time_taken_seconds
                })
        
        return FeedbackResponse(
            id=feedback.id,
            interview_id=feedback.interview_id,
            overall_score=feedback.overall_score,
            technical_score=feedback.technical_score,
            communication_score=feedback.communication_score,
            confidence_score=feedback.confidence_score,
            strengths=feedback.strengths or [],
            improvements=feedback.improvements or [],
            detailed_feedback=feedback.detailed_feedback or "",
            suggestions=feedback.suggestions,
            question_analysis=question_analysis,
            generated_at=feedback.generated_at.isoformat() if feedback.generated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback"
        )

@router.post("/{interview_id}/generate")
async def generate_feedback(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate feedback for an interview"""
    try:
        # Verify interview exists and belongs to user
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )
        
        if interview.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview must be completed before generating feedback"
            )
        
        # Check if feedback already exists
        existing_feedback = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
        if existing_feedback:
            # Delete existing feedback to regenerate
            db.delete(existing_feedback)
            db.commit()
        
        # Generate new feedback
        feedback = await generate_feedback_for_interview(interview, db)
        
        logger.info(f"Feedback generated for interview: {interview_id}")
        
        return {
            "success": True,
            "message": "Feedback generated successfully",
            "feedback_id": feedback.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generate feedback error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate feedback"
        )

async def generate_feedback_for_interview(interview: Interview, db: Session) -> Feedback:
    """Generate comprehensive feedback for an interview"""
    try:
        # Get all questions and answers
        questions = db.query(Question).filter(
            Question.interview_id == interview.id
        ).order_by(Question.question_order).all()
        
        # Evaluate individual answers first
        for question in questions:
            if question.is_answered() and not question.score:
                try:
                    evaluation = await evaluate_answer(
                        question=question.question_text,
                        answer=question.answer_text,
                        role=interview.role_selected,
                        interview_type=interview.interview_type
                    )
                    
                    if evaluation.get("success"):
                        question.score = evaluation.get("score", 75)
                        question.ai_feedback = evaluation.get("feedback", "Good response")
                        db.commit()
                        
                except Exception as e:
                    logger.warning(f"Failed to evaluate question {question.id}: {e}")
                    # Set default values if evaluation fails
                    question.score = 75
                    question.ai_feedback = "Response provided"
                    db.commit()
        
        # Prepare data for comprehensive feedback
        interview_data = {
            "role": interview.role_selected,
            "interview_type": interview.interview_type,
            "difficulty": interview.difficulty,
            "duration": interview.duration,
            "questions_count": len(questions),
            "answered_count": len([q for q in questions if q.is_answered()])
        }
        
        questions_and_answers = []
        for question in questions:
            if question.is_answered():
                questions_and_answers.append({
                    "question": question.question_text,
                    "answer": question.answer_text,
                    "type": question.question_type,
                    "score": question.score,
                    "feedback": question.ai_feedback
                })
        
        # Generate comprehensive feedback
        try:
            comprehensive_feedback = await generate_comprehensive_feedback(
                interview_data, questions_and_answers
            )
        except Exception as e:
            logger.warning(f"Failed to generate comprehensive feedback: {e}")
            # Use fallback feedback
            comprehensive_feedback = generate_fallback_feedback(questions_and_answers)
        
        # Create feedback record
        feedback = Feedback(
            interview_id=interview.id,
            overall_score=comprehensive_feedback.get("overall_score", 75),
            technical_score=comprehensive_feedback.get("technical_score", 75),
            communication_score=comprehensive_feedback.get("communication_score", 75),
            confidence_score=comprehensive_feedback.get("confidence_score", 75),
            strengths=comprehensive_feedback.get("strengths", []),
            improvements=comprehensive_feedback.get("improvements", []),
            detailed_feedback=comprehensive_feedback.get("detailed_feedback", ""),
            suggestions=comprehensive_feedback.get("suggestions", ""),
            question_analysis=[
                {
                    "question_id": q.id,
                    "question": q.question_text,
                    "answer": q.answer_text or "",
                    "score": q.score or 0,
                    "feedback": q.ai_feedback or ""
                }
                for q in questions if q.is_answered()
            ]
        )
        
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        return feedback
        
    except Exception as e:
        logger.error(f"Generate feedback for interview error: {e}")
        db.rollback()
        raise

def generate_fallback_feedback(questions_and_answers: List[Dict]) -> Dict[str, Any]:
    """Generate fallback feedback when AI service fails"""
    num_questions = len(questions_and_answers)
    
    # Calculate average score
    scores = [qa.get("score", 75) for qa in questions_and_answers if qa.get("score")]
    avg_score = sum(scores) / len(scores) if scores else 75
    
    return {
        "overall_score": avg_score,
        "technical_score": min(avg_score + 5, 100),
        "communication_score": max(avg_score - 3, 0),
        "confidence_score": avg_score + 2,
        "strengths": [
            "Completed the interview session",
            "Provided thoughtful responses",
            "Demonstrated engagement",
            "Showed professional attitude"
        ],
        "improvements": [
            "Provide more specific examples",
            "Elaborate on technical details",
            "Practice articulating thoughts clearly",
            "Ask clarifying questions when needed"
        ],
        "detailed_feedback": f"You completed {num_questions} questions in this interview session. Your responses demonstrate good understanding and engagement. The average quality of your answers suggests solid preparation. To improve further, focus on providing more detailed examples and practicing clear articulation of your thoughts. Overall, this was a productive interview session.",
        "suggestions": "Continue practicing mock interviews, prepare specific examples from your experience, and work on clearly explaining your thought process during technical discussions."
    }

@router.get("/{interview_id}/summary")
async def get_feedback_summary(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a summary of feedback for an interview"""
    try:
        # Verify interview exists and belongs to user
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )
        
        feedback = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
        
        if not feedback:
            return {
                "interview_id": interview_id,
                "feedback_available": False,
                "message": "Feedback not yet generated"
            }
        
        return {
            "interview_id": interview_id,
            "feedback_available": True,
            "overall_score": feedback.overall_score,
            "performance_level": feedback.get_performance_level(),
            "grade": feedback.get_overall_grade(),
            "strengths_count": len(feedback.strengths) if feedback.strengths else 0,
            "improvements_count": len(feedback.improvements) if feedback.improvements else 0,
            "generated_at": feedback.generated_at.isoformat() if feedback.generated_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get feedback summary error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback summary"
        )

@router.get("/user/stats")
async def get_user_feedback_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's overall feedback statistics"""
    try:
        # Get all user's interviews with feedback
        interviews_with_feedback = db.query(Interview, Feedback).join(
            Feedback, Interview.id == Feedback.interview_id
        ).filter(Interview.user_id == current_user.id).all()
        
        if not interviews_with_feedback:
            return {
                "total_interviews": 0,
                "average_score": 0,
                "improvement_trend": 0,
                "best_score": 0,
                "recent_performance": []
            }
        
        # Calculate statistics
        scores = [feedback.overall_score for _, feedback in interviews_with_feedback]
        technical_scores = [feedback.technical_score for _, feedback in interviews_with_feedback]
        communication_scores = [feedback.communication_score for _, feedback in interviews_with_feedback]
        
        # Calculate improvement trend (last 5 vs previous 5)
        recent_scores = scores[-5:] if len(scores) >= 5 else scores
        previous_scores = scores[-10:-5] if len(scores) >= 10 else []
        
        improvement_trend = 0
        if previous_scores and recent_scores:
            recent_avg = sum(recent_scores) / len(recent_scores)
            previous_avg = sum(previous_scores) / len(previous_scores)
            improvement_trend = recent_avg - previous_avg
        
        return {
            "total_interviews": len(interviews_with_feedback),
            "average_score": round(sum(scores) / len(scores), 1),
            "average_technical": round(sum(technical_scores) / len(technical_scores), 1),
            "average_communication": round(sum(communication_scores) / len(communication_scores), 1),
            "improvement_trend": round(improvement_trend, 1),
            "best_score": max(scores),
            "recent_performance": [
                {
                    "interview_id": interview.id,
                    "score": feedback.overall_score,
                    "date": interview.completed_at.isoformat() if interview.completed_at else None,
                    "role": interview.role_selected
                }
                for interview, feedback in interviews_with_feedback[-5:]
            ]
        }
        
    except Exception as e:
        logger.error(f"Get user feedback stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback statistics"
        )

# Health check for feedback service
@router.get("/health/check")
async def feedback_health_check():
    """Health check for feedback service"""
    return {
        "service": "feedback",
        "status": "healthy",
        "endpoints": [
            "GET /feedback/{interview_id}",
            "POST /feedback/{interview_id}/generate",
            "GET /feedback/{interview_id}/summary",
            "GET /feedback/user/stats"
        ]
    }
