"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string
        confidence: number
      }
      isFinal: boolean
    }
    length: number
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [confidence, setConfidence] = useState(0)

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognition = new SpeechRecognition()
      
      // Configuration
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i]
          if (result[0]) {
            const transcript = result[0].transcript
            const confidence = result[0].confidence

            if (result.isFinal) {
              finalTranscript = transcript
              setConfidence(confidence)
            } else {
              interimTranscript = transcript
            }
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ')
          setInterimTranscript('')
        } else {
          setInterimTranscript(interimTranscript)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(getErrorMessage(event.error))
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimTranscript('')
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.'
      case 'audio-capture':
        return 'Microphone not accessible. Please check permissions.'
      case 'not-allowed':
        return 'Microphone permission denied. Please allow microphone access.'
      case 'network':
        return 'Network error occurred. Please check your connection.'
      case 'aborted':
        return 'Speech recognition was aborted.'
      case 'language-not-supported':
        return 'Language not supported.'
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.'
      default:
        return `Speech recognition error: ${error}`
    }
  }

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available')
      return
    }

    if (isListening) {
      return
    }

    try {
      setError(null)
      setTranscript('')
      setInterimTranscript('')
      recognitionRef.current.start()

      // Auto-stop after 30 seconds to prevent indefinite listening
      timeoutRef.current = setTimeout(() => {
        stopListening()
      }, 30000)
    } catch (err) {
      setError('Failed to start speech recognition')
    }
  }, [isSupported, isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setConfidence(0)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort()
      }
    }
  }, [isListening])

  return {
    // State
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    confidence,
    
    // Actions
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    
    // Computed values
    hasTranscript: transcript.length > 0,
    fullTranscript: transcript + interimTranscript,
  }
}

export default useSpeechRecognition
