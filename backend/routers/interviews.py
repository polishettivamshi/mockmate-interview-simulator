from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

from database import get_db
from models.user import User
from models.interview import Interview
from models.question import Question
from utils.auth import get_current_user
from services.ai_service import generate_question

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class InterviewCreate(BaseModel):
    role: str
    custom_job_description: Optional[str] = None
    interview_type: str  # technical, behavioral, mixed
    difficulty: int  # 1-4
    duration: int  # minutes
    input_method: str = "both"  # voice, text, both
    
    @validator('difficulty')
    def validate_difficulty(cls, v):
        if v < 1 or v > 4:
            raise ValueError('Difficulty must be between 1 and 4')
        return v
    
    @validator('duration')
    def validate_duration(cls, v):
        if v < 5 or v > 120:
            raise ValueError('Duration must be between 5 and 120 minutes')
        return v
    
    @validator('interview_type')
    def validate_interview_type(cls, v):
        if v not in ['technical', 'behavioral', 'mixed']:
            raise ValueError('Interview type must be technical, behavioral, or mixed')
        return v

class QuestionRequest(BaseModel):
    context: Optional[str] = None

class AnswerSubmit(BaseModel):
    question_id: str
    answer: str
    time_taken_seconds: Optional[int] = None

class InterviewResponse(BaseModel):
    id: str
    role_selected: str
    interview_type: str
    difficulty: int
    duration: int
    status: str
    started_at: Optional[str]
    questions_count: int

class QuestionResponse(BaseModel):
    id: str
    text: str
    type: str
    order: int

@router.post("/", response_model=Dict[str, str])
async def create_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview session"""
    try:
        # Create interview record
        new_interview = Interview(
            user_id=current_user.id,
            role_selected=interview_data.role,
            custom_job_description=interview_data.custom_job_description,
            interview_type=interview_data.interview_type,
            difficulty=interview_data.difficulty,
            duration=interview_data.duration,
            input_method=interview_data.input_method,
            status="in-progress",
            config={
                "role": interview_data.role,
                "custom_job_description": interview_data.custom_job_description,
                "interview_type": interview_data.interview_type,
                "difficulty": interview_data.difficulty,
                "duration": interview_data.duration,
                "input_method": interview_data.input_method
            }
        )
        
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        
        logger.info(f"Interview created: {new_interview.id} for user {current_user.id}")
        
        return {
            "id": new_interview.id,
            "session_id": new_interview.id,
            "message": "Interview session created successfully"
        }
        
    except Exception as e:
        logger.error(f"Create interview error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create interview session"
        )

@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview details"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )
        
        return InterviewResponse(
            id=interview.id,
            role_selected=interview.role_selected,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            duration=interview.duration,
            status=interview.status,
            started_at=interview.started_at.isoformat() if interview.started_at else None,
            questions_count=len(interview.questions)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get interview error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interview"
        )

@router.post("/{interview_id}/question", response_model=QuestionResponse)
async def get_next_question(
    interview_id: str,
    question_request: QuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and return the next interview question"""
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
        
        if interview.status != "in-progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview is not active"
            )
        
        # Get current question count
        question_count = db.query(Question).filter(Question.interview_id == interview_id).count()
        next_order = question_count + 1
        
        # Generate question using AI service
        ai_result = await generate_question(
            role=interview.role_selected,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            context=question_request.context,
            question_number=next_order
        )
        
        if not ai_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate question"
            )
        
        # Create question record
        new_question = Question(
            interview_id=interview_id,
            question_text=ai_result["question"],
            question_type=ai_result["type"],
            question_order=next_order
        )
        
        db.add(new_question)
        db.commit()
        db.refresh(new_question)
        
        logger.info(f"Question generated: {new_question.id} for interview {interview_id}")
        
        return QuestionResponse(
            id=new_question.id,
            text=new_question.question_text,
            type=new_question.question_type,
            order=new_question.question_order
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generate question error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate question"
        )

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    answer_data: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an answer to a question"""
    try:
        # Verify interview and question
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )
        
        question = db.query(Question).filter(
            Question.id == answer_data.question_id,
            Question.interview_id == interview_id
        ).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        # Update question with answer
        question.answer_text = answer_data.answer
        question.answered_at = datetime.utcnow()
        question.time_taken_seconds = answer_data.time_taken_seconds
        
        # Calculate time taken if not provided
        if not question.time_taken_seconds:
            question.calculate_time_taken()
        
        db.commit()
        
        logger.info(f"Answer submitted for question {answer_data.question_id}")
        
        return {"success": True, "message": "Answer submitted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Submit answer error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit answer"
        )

@router.post("/{interview_id}/end")
async def end_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End an interview session"""
    try:
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )
        
        if interview.status != "in-progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview is not active"
            )
        
        # Update interview status
        interview.status = "completed"
        interview.completed_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Interview ended: {interview_id}")
        
        return {"success": True, "message": "Interview ended successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"End interview error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to end interview"
        )

@router.get("/{interview_id}/questions")
async def get_interview_questions(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all questions for an interview"""
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
        
        # Get questions
        questions = db.query(Question).filter(
            Question.interview_id == interview_id
        ).order_by(Question.question_order).all()
        
        return {
            "interview_id": interview_id,
            "questions": [
                {
                    "id": q.id,
                    "text": q.question_text,
                    "answer": q.answer_text,
                    "type": q.question_type,
                    "order": q.question_order,
                    "score": q.score,
                    "feedback": q.ai_feedback,
                    "time_taken_seconds": q.time_taken_seconds,
                    "answered": q.is_answered()
                }
                for q in questions
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get interview questions error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve questions"
        )

@router.get("/")
async def get_user_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """Get user's interview history"""
    try:
        interviews = db.query(Interview).filter(
            Interview.user_id == current_user.id
        ).order_by(Interview.created_at.desc()).offset(offset).limit(limit).all()
        
        return {
            "interviews": [
                {
                    "id": interview.id,
                    "role": interview.role_selected,
                    "type": interview.interview_type,
                    "difficulty": interview.difficulty,
                    "duration": interview.duration,
                    "status": interview.status,
                    "started_at": interview.started_at.isoformat() if interview.started_at else None,
                    "completed_at": interview.completed_at.isoformat() if interview.completed_at else None,
                    "questions_count": len(interview.questions),
                    "answered_questions": len([q for q in interview.questions if q.is_answered()])
                }
                for interview in interviews
            ],
            "total": db.query(Interview).filter(Interview.user_id == current_user.id).count()
        }
        
    except Exception as e:
        logger.error(f"Get user interviews error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interviews"
        )

# Health check for interviews service
@router.get("/health/check")
async def interviews_health_check():
    """Health check for interviews service"""
    return {
        "service": "interviews",
        "status": "healthy",
        "endpoints": [
            "POST /interviews/",
            "GET /interviews/{id}",
            "POST /interviews/{id}/question",
            "POST /interviews/{id}/answer",
            "POST /interviews/{id}/end"
        ]
    }
