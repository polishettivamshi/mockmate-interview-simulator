"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface FeedbackData {
  overallScore: number
  technicalScore: number
  communicationScore: number
  confidenceScore: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  questionAnalysis: Array<{
    question: string
    answer: string
    score: number
    feedback: string
  }>
}

interface InterviewData {
  config: any
  conversation: Array<{type: 'question' | 'answer', content: string, timestamp: Date}>
  completedAt: Date
  questionsAnswered: number
  totalQuestions: number
}

export default function FeedbackPage() {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load interview data
    const savedInterview = localStorage.getItem('lastInterview')
    if (savedInterview) {
      const data = JSON.parse(savedInterview)
      setInterviewData(data)
      generateFeedback(data)
    } else {
      router.push('/dashboard')
    }
  }, [])

  const generateFeedback = async (data: InterviewData) => {
    setLoading(true)
    
    try {
      // TODO: Replace with actual AI feedback generation
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock feedback data
      const mockFeedback: FeedbackData = {
        overallScore: 78,
        technicalScore: 82,
        communicationScore: 75,
        confidenceScore: 76,
        strengths: [
          'Clear and structured responses',
          'Good technical knowledge demonstration',
          'Effective use of examples',
          'Professional communication style'
        ],
        improvements: [
          'Could provide more specific metrics in examples',
          'Consider asking more clarifying questions',
          'Work on reducing filler words',
          'Expand on problem-solving approach'
        ],
        detailedFeedback: `Your interview performance shows strong technical competency with room for improvement in communication confidence. You demonstrated solid understanding of core concepts and provided relevant examples. Your responses were well-structured and professional. 

Key highlights include your systematic approach to problem-solving and ability to explain complex technical concepts clearly. However, there were opportunities to ask more clarifying questions and provide more quantifiable results in your examples.

Overall, this was a solid performance that would likely progress to the next round in most interview processes.`,
        questionAnalysis: data.conversation
          .filter((item, index) => item.type === 'question' && index < data.conversation.length - 1)
          .map((question, index) => {
            const answerIndex = data.conversation.findIndex((item, i) => i > data.conversation.indexOf(question) && item.type === 'answer')
            const answer = answerIndex !== -1 ? data.conversation[answerIndex] : null
            
            return {
              question: question.content,
              answer: answer?.content || 'No answer provided',
              score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
              feedback: [
                'Good structure and clarity in your response.',
                'Consider providing more specific examples.',
                'Strong technical understanding demonstrated.',
                'Could benefit from more detailed explanation.',
                'Excellent use of relevant experience.'
              ][Math.floor(Math.random() * 5)]
            }
          })
      }
      
      setFeedback(mockFeedback)
    } catch (error) {
      console.error('Failed to generate feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Average'
    if (score >= 60) return 'Below Average'
    return 'Needs Improvement'
  }

  if (loading || !feedback || !interviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your interview performance...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-gray-900">MockMate</h1>
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Interview Feedback</span>
          </div>
          <div className="flex space-x-3">
            <Link href="/interview/setup">
              <Button variant="outline">New Interview</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Complete!
          </h2>
          <p className="text-gray-600">
            Here's your detailed performance analysis and feedback
          </p>
        </div>

        {/* Overall Score */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                <span className={`text-3xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                  {feedback.overallScore}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Overall Score</h3>
              <p className="text-gray-600 mb-4">{getScoreLabel(feedback.overallScore)}</p>
              <div className="flex justify-center space-x-8 text-sm">
                <div className="text-center">
                  <div className="font-medium">Questions Answered</div>
                  <div className="text-gray-600">{interviewData.questionsAnswered} of {interviewData.totalQuestions}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Interview Type</div>
                  <div className="text-gray-600 capitalize">{interviewData.config.interviewType}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Duration</div>
                  <div className="text-gray-600">{interviewData.config.duration} minutes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Technical Skills</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(feedback.technicalScore)}`}>
                {feedback.technicalScore}%
              </div>
              <Progress value={feedback.technicalScore} className="mb-2" />
              <p className="text-sm text-gray-600">{getScoreLabel(feedback.technicalScore)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(feedback.communicationScore)}`}>
                {feedback.communicationScore}%
              </div>
              <Progress value={feedback.communicationScore} className="mb-2" />
              <p className="text-sm text-gray-600">{getScoreLabel(feedback.communicationScore)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Confidence</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(feedback.confidenceScore)}`}>
                {feedback.confidenceScore}%
              </div>
              <Progress value={feedback.confidenceScore} className="mb-2" />
              <p className="text-sm text-gray-600">{getScoreLabel(feedback.confidenceScore)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Detailed Feedback</CardTitle>
                <CardDescription>
                  Comprehensive analysis of your interview performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {feedback.detailedFeedback.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Strengths</CardTitle>
                <CardDescription>
                  Areas where you performed well
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>
                  Suggestions to enhance your interview performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="space-y-4">
              {feedback.questionAnalysis.map((analysis, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Badge variant={analysis.score >= 80 ? 'default' : analysis.score >= 60 ? 'secondary' : 'destructive'}>
                        {analysis.score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Question:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{analysis.question}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Your Answer:</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded">{analysis.answer.substring(0, 200)}...</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Feedback:</h4>
                      <p className="text-gray-600">{analysis.feedback}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link href="/interview/setup">
            <Button size="lg">Practice Again</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">View Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
