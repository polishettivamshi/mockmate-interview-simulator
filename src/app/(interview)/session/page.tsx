"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Question {
  id: string
  text: string
  type: 'technical' | 'behavioral'
}

interface InterviewConfig {
  role: string
  customJobDescription: string
  interviewType: string
  difficulty: number
  duration: number
  inputMethod: string
}

export default function InterviewSessionPage() {
  const [config, setConfig] = useState<InterviewConfig | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions] = useState(8)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [conversation, setConversation] = useState<Array<{type: 'question' | 'answer', content: string, timestamp: Date}>>([])
  const [error, setError] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Speech recognition setup
  const [speechRecognition, setSpeechRecognition] = useState<any>(null)
  const [speechSupported, setSpeechSupported] = useState(false)

  useEffect(() => {
    // Load interview configuration
    const savedConfig = localStorage.getItem('interviewConfig')
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig)
      setConfig(parsedConfig)
      setTimeRemaining(parsedConfig.duration * 60) // Convert to seconds
    } else {
      router.push('/interview/setup')
      return
    }

    // Check for speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setAnswer(prev => prev + ' ' + transcript)
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setError('Speech recognition error. Please try typing your answer.')
          setIsRecording(false)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
        }
        
        setSpeechRecognition(recognition)
        setSpeechSupported(true)
      }
    }

    // Start the interview
    startInterview()
  }, [])

  useEffect(() => {
    if (sessionStarted && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && sessionStarted) {
      endInterview()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, sessionStarted])

  const startInterview = async () => {
    setIsLoading(true)
    try {
      // Generate first question
      await generateNextQuestion()
      setSessionStarted(true)
    } catch (error) {
      setError('Failed to start interview. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateNextQuestion = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call to AI service
      const mockQuestions = [
        {
          id: '1',
          text: 'Tell me about yourself and your background in software engineering.',
          type: 'behavioral' as const
        },
        {
          id: '2',
          text: 'How would you approach debugging a performance issue in a web application?',
          type: 'technical' as const
        },
        {
          id: '3',
          text: 'Describe a challenging project you worked on and how you overcame obstacles.',
          type: 'behavioral' as const
        },
        {
          id: '4',
          text: 'Explain the difference between SQL and NoSQL databases and when you would use each.',
          type: 'technical' as const
        },
        {
          id: '5',
          text: 'How do you handle working with difficult team members?',
          type: 'behavioral' as const
        },
        {
          id: '6',
          text: 'Design a system to handle 1 million concurrent users.',
          type: 'technical' as const
        },
        {
          id: '7',
          text: 'What motivates you in your work?',
          type: 'behavioral' as const
        },
        {
          id: '8',
          text: 'Do you have any questions for me about the role or company?',
          type: 'behavioral' as const
        }
      ]

      const question = mockQuestions[questionIndex] || mockQuestions[0]
      setCurrentQuestion(question)
      
      setConversation(prev => [...prev, {
        type: 'question',
        content: question.text,
        timestamp: new Date()
      }])
    } catch (error) {
      setError('Failed to generate question. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer before continuing.')
      return
    }

    setIsLoading(true)
    
    // Add answer to conversation
    setConversation(prev => [...prev, {
      type: 'answer',
      content: answer,
      timestamp: new Date()
    }])

    // Clear current answer
    setAnswer('')

    // Move to next question or end interview
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex(prev => prev + 1)
      await generateNextQuestion()
    } else {
      endInterview()
    }

    setIsLoading(false)
  }

  const startRecording = () => {
    if (!speechRecognition) {
      setError('Speech recognition not supported in your browser.')
      return
    }

    try {
      setIsRecording(true)
      setError('')
      speechRecognition.start()
    } catch (error) {
      setError('Failed to start recording. Please check microphone permissions.')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (speechRecognition && isRecording) {
      speechRecognition.stop()
    }
    setIsRecording(false)
  }

  const endInterview = () => {
    // Save interview data
    const interviewData = {
      config,
      conversation,
      completedAt: new Date(),
      questionsAnswered: questionIndex + 1,
      totalQuestions
    }
    
    localStorage.setItem('lastInterview', JSON.stringify(interviewData))
    router.push('/interview/feedback')
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!config) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading interview configuration...</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">MockMate</h1>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Interview Session</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              Question {questionIndex + 1} of {totalQuestions}
            </Badge>
            <Badge variant={timeRemaining < 300 ? 'destructive' : 'secondary'}>
              {formatTime(timeRemaining)}
            </Badge>
            <Button variant="outline" onClick={endInterview}>
              End Interview
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Interview Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round(((questionIndex + 1) / totalQuestions) * 100)}% Complete
            </span>
          </div>
          <Progress value={((questionIndex + 1) / totalQuestions) * 100} className="h-2" />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Question</CardTitle>
                  {currentQuestion && (
                    <Badge variant={currentQuestion.type === 'technical' ? 'default' : 'secondary'}>
                      {currentQuestion.type}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Generating your next question...</p>
                  </div>
                ) : currentQuestion ? (
                  <div className="text-lg leading-relaxed">
                    {currentQuestion.text}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Preparing your interview...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Answer Input */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your answer here or use voice input..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[150px]"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {speechSupported && config.inputMethod !== 'text' && (
                      <>
                        {!isRecording ? (
                          <Button
                            variant="outline"
                            onClick={startRecording}
                            disabled={isLoading}
                          >
                            🎤 Start Recording
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            onClick={stopRecording}
                          >
                            ⏹️ Stop Recording
                          </Button>
                        )}
                      </>
                    )}
                    {isRecording && (
                      <span className="text-sm text-red-600 animate-pulse">
                        Recording...
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setAnswer('')}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={submitAnswer}
                      disabled={isLoading || !answer.trim()}
                    >
                      {isLoading ? 'Processing...' : 'Submit Answer'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interview Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Role:</span>
                  <p className="text-gray-600">{config.role || 'Custom Role'}</p>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="text-gray-600 capitalize">{config.interviewType}</p>
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span>
                  <p className="text-gray-600">
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'][config.difficulty - 1]}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Take your time to think</li>
                  <li>• Use specific examples</li>
                  <li>• Ask clarifying questions</li>
                  <li>• Stay calm and confident</li>
                  <li>• Structure your answers clearly</li>
                </ul>
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {conversation.map((item, index) => (
                    <div key={index} className={`text-sm ${
                      item.type === 'question' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      <span className="font-medium">
                        {item.type === 'question' ? 'Q:' : 'A:'}
                      </span>
                      <p className="mt-1">{item.content.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
