import httpx
import json
import logging
from typing import Dict, List, Optional, Any
from config import settings

logger = logging.getLogger(__name__)

class AIService:
    """Service for handling AI interactions via OpenRouter API"""
    
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = settings.openrouter_base_url
        self.default_model = settings.default_model
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "MockMate Interview Simulator"
        }
    
    async def _make_request(self, messages: List[Dict], model: Optional[str] = None) -> Dict[str, Any]:
        """Make a request to the OpenRouter API"""
        if not self.api_key:
            logger.warning("OpenRouter API key not configured, using mock response")
            return self._get_mock_response(messages)
        
        try:
            payload = {
                "model": model or self.default_model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1000,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0
            }
            
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                headers=self._get_headers(),
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "content": data["choices"][0]["message"]["content"],
                    "model": data.get("model", model),
                    "usage": data.get("usage", {})
                }
            else:
                logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}",
                    "fallback": True
                }
                
        except Exception as e:
            logger.error(f"AI service request error: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback": True
            }
    
    def _get_mock_response(self, messages: List[Dict]) -> Dict[str, Any]:
        """Generate mock responses when API is not available"""
        last_message = messages[-1]["content"].lower() if messages else ""
        
        # Mock interview questions based on context
        if "generate question" in last_message or "next question" in last_message:
            mock_questions = [
                "Tell me about yourself and your background in this field.",
                "What interests you most about this role?",
                "Describe a challenging project you've worked on recently.",
                "How do you handle working under pressure?",
                "What are your greatest strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why should we hire you for this position?",
                "Do you have any questions for me?"
            ]
            import random
            question = random.choice(mock_questions)
            
            return {
                "success": True,
                "content": question,
                "model": "mock-model",
                "usage": {"total_tokens": 50}
            }
        
        # Mock feedback generation
        elif "feedback" in last_message or "evaluate" in last_message:
            return {
                "success": True,
                "content": "Your response demonstrates good understanding of the topic. You provided relevant examples and showed clear communication skills. To improve, consider being more specific with metrics and asking clarifying questions.",
                "model": "mock-model",
                "usage": {"total_tokens": 100}
            }
        
        # Default mock response
        return {
            "success": True,
            "content": "Thank you for your response. Let's continue with the next question.",
            "model": "mock-model",
            "usage": {"total_tokens": 25}
        }
    
    async def generate_interview_question(
        self, 
        role: str, 
        interview_type: str, 
        difficulty: int,
        context: Optional[str] = None,
        question_number: int = 1
    ) -> Dict[str, Any]:
        """Generate an interview question based on role and context"""
        
        system_prompt = f"""You are an experienced interviewer conducting a {interview_type} interview for a {role} position. 
        
        Your task is to generate appropriate interview questions based on:
        - Role: {role}
        - Interview Type: {interview_type}
        - Difficulty Level: {difficulty}/4 (1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert)
        - Question Number: {question_number}
        
        Guidelines:
        - Ask one clear, specific question
        - Match the difficulty level appropriately
        - For technical interviews, include coding, system design, or technical concepts
        - For behavioral interviews, focus on past experiences and soft skills
        - Keep questions professional and relevant
        - Don't repeat previous questions from the context
        
        Return only the question text, nothing else."""
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if context:
            messages.append({
                "role": "user", 
                "content": f"Previous conversation context:\n{context}\n\nGenerate the next appropriate question."
            })
        else:
            messages.append({
                "role": "user", 
                "content": f"Generate the first question for this interview."
            })
        
        result = await self._make_request(messages)
        
        if result.get("success"):
            return {
                "question": result["content"].strip(),
                "type": "technical" if "technical" in interview_type.lower() else "behavioral",
                "difficulty": difficulty,
                "model_used": result.get("model"),
                "success": True
            }
        else:
            # Fallback question
            fallback_questions = {
                "technical": [
                    "Explain the difference between a stack and a queue.",
                    "How would you optimize a slow database query?",
                    "Describe the process of debugging a production issue.",
                    "What are the key principles of good software design?"
                ],
                "behavioral": [
                    "Tell me about a time you had to work with a difficult team member.",
                    "Describe a project where you had to learn something new quickly.",
                    "How do you prioritize tasks when you have multiple deadlines?",
                    "Give me an example of when you had to make a difficult decision."
                ]
            }
            
            import random
            question_type = "technical" if "technical" in interview_type.lower() else "behavioral"
            fallback_question = random.choice(fallback_questions[question_type])
            
            return {
                "question": fallback_question,
                "type": question_type,
                "difficulty": difficulty,
                "model_used": "fallback",
                "success": True,
                "fallback": True
            }
    
    async def evaluate_answer(
        self, 
        question: str, 
        answer: str, 
        role: str,
        interview_type: str
    ) -> Dict[str, Any]:
        """Evaluate an interview answer and provide feedback"""
        
        system_prompt = f"""You are an expert interviewer evaluating answers for a {role} position in a {interview_type} interview.

        Your task is to evaluate the candidate's answer and provide:
        1. A score from 0-100
        2. Specific feedback on strengths and areas for improvement
        3. Suggestions for better responses

        Evaluation criteria:
        - Relevance to the question
        - Clarity of communication
        - Technical accuracy (for technical questions)
        - Use of specific examples
        - Problem-solving approach
        - Confidence and professionalism

        Provide your response in this JSON format:
        {{
            "score": <number 0-100>,
            "feedback": "<detailed feedback>",
            "strengths": ["<strength1>", "<strength2>"],
            "improvements": ["<improvement1>", "<improvement2>"]
        }}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Question: {question}\n\nCandidate's Answer: {answer}\n\nPlease evaluate this response."}
        ]
        
        result = await self._make_request(messages)
        
        if result.get("success"):
            try:
                # Try to parse JSON response
                content = result["content"].strip()
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                
                evaluation = json.loads(content)
                
                return {
                    "score": evaluation.get("score", 75),
                    "feedback": evaluation.get("feedback", "Good response overall."),
                    "strengths": evaluation.get("strengths", ["Clear communication"]),
                    "improvements": evaluation.get("improvements", ["Could provide more specific examples"]),
                    "model_used": result.get("model"),
                    "success": True
                }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "score": 75,
                    "feedback": result["content"],
                    "strengths": ["Provided a response"],
                    "improvements": ["Could be more detailed"],
                    "model_used": result.get("model"),
                    "success": True,
                    "fallback": True
                }
        else:
            # Fallback evaluation
            return {
                "score": 70,
                "feedback": "Your answer shows understanding of the topic. Consider providing more specific examples and details to strengthen your response.",
                "strengths": ["Addressed the question", "Clear communication"],
                "improvements": ["Add specific examples", "Provide more technical details"],
                "model_used": "fallback",
                "success": True,
                "fallback": True
            }
    
    async def generate_overall_feedback(
        self, 
        interview_data: Dict,
        questions_and_answers: List[Dict]
    ) -> Dict[str, Any]:
        """Generate comprehensive feedback for the entire interview"""
        
        system_prompt = f"""You are an expert interview coach providing comprehensive feedback for a {interview_data.get('role', 'professional')} interview.

        Analyze the entire interview performance and provide:
        1. Overall assessment and score (0-100)
        2. Breakdown scores for: technical skills, communication, confidence
        3. Key strengths (3-5 points)
        4. Areas for improvement (3-5 points)
        5. Detailed feedback paragraph
        6. Specific suggestions for improvement

        Consider:
        - Consistency across answers
        - Technical competency
        - Communication clarity
        - Use of examples
        - Problem-solving approach
        - Interview presence and confidence

        Provide response in JSON format:
        {{
            "overall_score": <0-100>,
            "technical_score": <0-100>,
            "communication_score": <0-100>,
            "confidence_score": <0-100>,
            "strengths": ["strength1", "strength2", ...],
            "improvements": ["improvement1", "improvement2", ...],
            "detailed_feedback": "<comprehensive paragraph>",
            "suggestions": "<specific actionable advice>"
        }}"""
        
        # Build context from questions and answers
        qa_context = "\n\n".join([
            f"Q: {qa['question']}\nA: {qa['answer'][:200]}..." 
            for qa in questions_and_answers
        ])
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Interview Details:\n{json.dumps(interview_data, indent=2)}\n\nQuestions and Answers:\n{qa_context}\n\nPlease provide comprehensive feedback."}
        ]
        
        result = await self._make_request(messages)
        
        if result.get("success"):
            try:
                content = result["content"].strip()
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                
                feedback = json.loads(content)
                
                return {
                    "overall_score": feedback.get("overall_score", 75),
                    "technical_score": feedback.get("technical_score", 75),
                    "communication_score": feedback.get("communication_score", 75),
                    "confidence_score": feedback.get("confidence_score", 75),
                    "strengths": feedback.get("strengths", ["Good overall performance"]),
                    "improvements": feedback.get("improvements", ["Continue practicing"]),
                    "detailed_feedback": feedback.get("detailed_feedback", "Solid interview performance with room for growth."),
                    "suggestions": feedback.get("suggestions", "Keep practicing and focus on specific examples."),
                    "model_used": result.get("model"),
                    "success": True
                }
            except json.JSONDecodeError:
                # Fallback comprehensive feedback
                return self._generate_fallback_comprehensive_feedback(questions_and_answers)
        else:
            return self._generate_fallback_comprehensive_feedback(questions_and_answers)
    
    def _generate_fallback_comprehensive_feedback(self, questions_and_answers: List[Dict]) -> Dict[str, Any]:
        """Generate fallback comprehensive feedback"""
        num_questions = len(questions_and_answers)
        answered_questions = len([qa for qa in questions_and_answers if qa.get('answer', '').strip()])
        
        # Calculate basic scores
        completion_rate = (answered_questions / num_questions * 100) if num_questions > 0 else 0
        base_score = min(75 + (completion_rate - 100) * 0.2, 85)
        
        return {
            "overall_score": int(base_score),
            "technical_score": int(base_score + 5),
            "communication_score": int(base_score - 2),
            "confidence_score": int(base_score + 1),
            "strengths": [
                "Completed the interview session",
                "Provided responses to questions",
                "Demonstrated engagement",
                "Showed professional attitude"
            ],
            "improvements": [
                "Provide more specific examples",
                "Elaborate on technical details",
                "Ask clarifying questions",
                "Practice articulating thoughts clearly"
            ],
            "detailed_feedback": f"You completed {answered_questions} out of {num_questions} questions in this interview. Your responses show good engagement and understanding. To improve, focus on providing more detailed examples and asking clarifying questions when needed. Overall, this was a solid performance that demonstrates your potential.",
            "suggestions": "Continue practicing mock interviews, prepare specific examples from your experience, and work on clearly articulating your thought process during technical discussions.",
            "model_used": "fallback",
            "success": True,
            "fallback": True
        }

# Global AI service instance
ai_service = AIService()

# Convenience functions
async def generate_question(role: str, interview_type: str, difficulty: int, context: str = None, question_number: int = 1):
    """Convenience function to generate a question"""
    async with AIService() as service:
        return await service.generate_interview_question(role, interview_type, difficulty, context, question_number)

async def evaluate_answer(question: str, answer: str, role: str, interview_type: str):
    """Convenience function to evaluate an answer"""
    async with AIService() as service:
        return await service.evaluate_answer(question, answer, role, interview_type)

async def generate_comprehensive_feedback(interview_data: Dict, questions_and_answers: List[Dict]):
    """Convenience function to generate comprehensive feedback"""
    async with AIService() as service:
        return await service.generate_overall_feedback(interview_data, questions_and_answers)
