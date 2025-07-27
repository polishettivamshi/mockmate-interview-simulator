"use client"

import { useState, useCallback } from 'react'
import apiClient from '@/lib/api'

interface Question {
  id: string
  text: string
  type: 'technical' | 'behavioral'
}

interface InterviewConfig {
  role: string
  customJobDescription?: string
  interviewType: string
  difficulty: number
  duration: number
  inputMethod: string
}

interface ConversationItem {
  type: 'question' | 'answer'
  content: string
  timestamp: Date
}

export const useInterview = () => {
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [conversation, setConversation] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionActive, setSessionActive] = useState(false)

  const startInterview = useCallback(async (config: InterviewConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.createInterview(config)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setInterviewId(response.data.id)
        setSessionActive(true)
        
        // Get first question
        await getNextQuestion(response.data.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getNextQuestion = useCallback(async (id?: string) => {
    const currentId = id || interviewId
    if (!currentId) return

    setIsLoading(true)
    setError(null)

    try {
      // Build context from conversation history
      const context = conversation
        .map(item => `${item.type}: ${item.content}`)
        .join('\n')

      const response = await apiClient.getQuestion(currentId, context)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setCurrentQuestion(response.data)
        
        // Add question to conversation
        setConversation(prev => [...prev, {
          type: 'question',
          content: response.data!.text,
          timestamp: new Date()
        }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next question')
    } finally {
      setIsLoading(false)
    }
  }, [interviewId, conversation])

  const submitAnswer = useCallback(async (answer: string) => {
    if (!interviewId || !currentQuestion) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.submitAnswer(interviewId, currentQuestion.id, answer)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Add answer to conversation
      setConversation(prev => [...prev, {
        type: 'answer',
        content: answer,
        timestamp: new Date()
      }])

      // Move to next question
      setQuestionIndex(prev => prev + 1)
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [interviewId, currentQuestion])

  const endInterview = useCallback(async () => {
    if (!interviewId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.endInterview(interviewId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      setSessionActive(false)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end interview')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [interviewId])

  const resetInterview = useCallback(() => {
    setInterviewId(null)
    setCurrentQuestion(null)
    setQuestionIndex(0)
    setConversation([])
    setError(null)
    setSessionActive(false)
  }, [])

  return {
    // State
    interviewId,
    currentQuestion,
    questionIndex,
    conversation,
    isLoading,
    error,
    sessionActive,
    
    // Actions
    startInterview,
    getNextQuestion,
    submitAnswer,
    endInterview,
    resetInterview,
    
    // Utilities
    clearError: () => setError(null),
  }
}

export default useInterview
