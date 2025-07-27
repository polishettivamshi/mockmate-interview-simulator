"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface InterviewSession {
  id: string
  date: string
  role: string
  duration: string
  technicalScore: number
  communicationScore: number
  overallScore: number
  status: 'completed' | 'in-progress'
}

export default function DashboardPage() {
  const [user, setUser] = useState({ name: 'John Doe', role: 'Software Engineer' })
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([])
  const [stats, setStats] = useState({
    totalSessions: 12,
    averageScore: 78,
    improvementRate: 15,
    streakDays: 5
  })

  useEffect(() => {
    // TODO: Replace with actual API calls
    setRecentSessions([
      {
        id: '1',
        date: '2024-01-15',
        role: 'Software Engineer',
        duration: '25 min',
        technicalScore: 85,
        communicationScore: 78,
        overallScore: 82,
        status: 'completed'
      },
      {
        id: '2',
        date: '2024-01-14',
        role: 'Software Engineer',
        duration: '30 min',
        technicalScore: 72,
        communicationScore: 80,
        overallScore: 76,
        status: 'completed'
      },
      {
        id: '3',
        date: '2024-01-13',
        role: 'Product Manager',
        duration: '22 min',
        technicalScore: 68,
        communicationScore: 85,
        overallScore: 74,
        status: 'completed'
      }
    ])
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">MockMate</h1>
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome back, {user.name}</span>
            <Button variant="outline" size="sm">
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Ready to practice your {user.role} interview skills?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Start New Interview</h3>
              <p className="text-sm text-gray-600 mb-4">
                Begin a new practice session
              </p>
              <Link href="/interview/setup">
                <Button className="w-full">Start Interview</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Review Feedback</h3>
              <p className="text-sm text-gray-600 mb-4">
                Analyze your recent performance
              </p>
              <Button variant="outline" className="w-full">
                View Feedback
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Practice Goals</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set and track your objectives
              </p>
              <Button variant="outline" className="w-full">
                Manage Goals
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalSessions}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.averageScore}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                +{stats.improvementRate}%
              </div>
              <div className="text-sm text-gray-600">Improvement</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.streakDays}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Interview Sessions</CardTitle>
                <CardDescription>
                  Your latest practice sessions and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{session.role}</h4>
                          <Badge variant="outline">{session.duration}</Badge>
                          <span className="text-sm text-gray-500">{session.date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Technical: <span className={getScoreColor(session.technicalScore)}>{session.technicalScore}%</span></span>
                          <span>Communication: <span className={getScoreColor(session.communicationScore)}>{session.communicationScore}%</span></span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getScoreBadgeVariant(session.overallScore)}>
                          {session.overallScore}%
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  Track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Technical Skills</span>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Communication</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm text-gray-600">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Performance</span>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed insights into your interview performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Analytics dashboard coming soon!</p>
                  <p className="text-sm text-gray-400">
                    We're working on detailed charts and insights to help you track your progress better.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
