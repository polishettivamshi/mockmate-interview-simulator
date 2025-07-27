"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'

export default function InterviewSetupPage() {
  const [selectedRole, setSelectedRole] = useState('')
  const [customJobDescription, setCustomJobDescription] = useState('')
  const [interviewType, setInterviewType] = useState('technical')
  const [difficulty, setDifficulty] = useState([2])
  const [duration, setDuration] = useState([20])
  const [inputMethod, setInputMethod] = useState('both')
  const router = useRouter()

  const roles = [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      description: 'Technical coding and system design questions',
      popular: true
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: 'Data analysis, SQL, and statistical questions',
      popular: true
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      description: 'Product strategy and management scenarios',
      popular: true
    },
    {
      id: 'marketing-manager',
      title: 'Marketing Manager',
      description: 'Marketing strategy and campaign questions',
      popular: false
    },
    {
      id: 'sales-rep',
      title: 'Sales Representative',
      description: 'Sales scenarios and customer interaction',
      popular: false
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      description: 'Business process and analysis questions',
      popular: false
    },
    {
      id: 'ux-designer',
      title: 'UX/UI Designer',
      description: 'Design thinking and user experience',
      popular: false
    },
    {
      id: 'project-manager',
      title: 'Project Manager',
      description: 'Project management and leadership',
      popular: false
    }
  ]

  const getDifficultyLabel = (value: number) => {
    const labels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    return labels[value - 1] || 'Intermediate'
  }

  const handleStartInterview = () => {
    if (!selectedRole && !customJobDescription.trim()) {
      alert('Please select a role or provide a job description')
      return
    }

    // Store interview configuration
    const config = {
      role: selectedRole,
      customJobDescription,
      interviewType,
      difficulty: difficulty[0],
      duration: duration[0],
      inputMethod
    }

    localStorage.setItem('interviewConfig', JSON.stringify(config))
    router.push('/interview/session')
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
            <span className="text-gray-600">Interview Setup</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Mock Interview
          </h2>
          <p className="text-gray-600">
            Configure your interview session to match your target role and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Choose Your Target Role</CardTitle>
                <CardDescription>
                  Select the role you're preparing for, or provide a custom job description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      {role.popular && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      <h4 className="font-medium mb-1">{role.title}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="job-description" className="text-base font-medium">
                    Or paste a job description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here for a customized interview experience..."
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interview Configuration */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Interview Configuration</CardTitle>
                <CardDescription>
                  Customize your interview experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interview Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Interview Type</Label>
                  <RadioGroup value={interviewType} onValueChange={setInterviewType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical">Technical Interview</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="behavioral" id="behavioral" />
                      <Label htmlFor="behavioral">Behavioral Interview</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mixed (Technical + Behavioral)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Difficulty Level: {getDifficultyLabel(difficulty[0])}
                  </Label>
                  <Slider
                    value={difficulty}
                    onValueChange={setDifficulty}
                    max={4}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Duration: {duration[0]} minutes
                  </Label>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={60}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>10 min</span>
                    <span>30 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                {/* Input Method */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Preferred Input Method</Label>
                  <Select value={inputMethod} onValueChange={setInputMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice">Voice Only</SelectItem>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="both">Both Voice & Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Start */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Role:</span>
                  <p className="text-sm text-gray-600">
                    {selectedRole 
                      ? roles.find(r => r.id === selectedRole)?.title 
                      : customJobDescription 
                        ? 'Custom Role' 
                        : 'Not selected'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Type:</span>
                  <p className="text-sm text-gray-600 capitalize">{interviewType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Difficulty:</span>
                  <p className="text-sm text-gray-600">{getDifficultyLabel(difficulty[0])}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Duration:</span>
                  <p className="text-sm text-gray-600">{duration[0]} minutes</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Input:</span>
                  <p className="text-sm text-gray-600 capitalize">{inputMethod}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Ready to start?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your AI interviewer will ask relevant questions based on your configuration.
                </p>
                <Button 
                  onClick={handleStartInterview}
                  className="w-full"
                  size="lg"
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h4 className="font-medium mb-2">Tips for Success</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Take your time to think before answering</li>
                  <li>• Use specific examples when possible</li>
                  <li>• Stay calm and confident</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
