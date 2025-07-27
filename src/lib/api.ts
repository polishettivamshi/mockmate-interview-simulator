const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.message || `HTTP error! status: ${response.status}`,
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.data?.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token)
      }
    }

    return response
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role: string
  }) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.data?.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token)
      }
    }

    return response
  }

  async logout() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  // Interview methods
  async createInterview(config: {
    role: string
    customJobDescription?: string
    interviewType: string
    difficulty: number
    duration: number
  }) {
    return this.request<{ id: string; sessionId: string }>('/interviews', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  async getQuestion(interviewId: string, context?: string) {
    return this.request<{
      id: string
      text: string
      type: 'technical' | 'behavioral'
    }>(`/interviews/${interviewId}/question`, {
      method: 'POST',
      body: JSON.stringify({ context }),
    })
  }

  async submitAnswer(interviewId: string, questionId: string, answer: string) {
    return this.request<{ success: boolean }>(`/interviews/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    })
  }

  async getInterview(interviewId: string) {
    return this.request<{
      id: string
      config: any
      questions: any[]
      status: string
    }>(`/interviews/${interviewId}`)
  }

  async endInterview(interviewId: string) {
    return this.request<{ success: boolean }>(`/interviews/${interviewId}/end`, {
      method: 'POST',
    })
  }

  // Feedback methods
  async getFeedback(interviewId: string) {
    return this.request<{
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
    }>(`/feedback/${interviewId}`)
  }

  async generateFeedback(interviewId: string) {
    return this.request<{ success: boolean }>(`/feedback/${interviewId}/generate`, {
      method: 'POST',
    })
  }

  // User methods
  async getProfile() {
    return this.request<{
      id: string
      name: string
      email: string
      role: string
    }>('/user/profile')
  }

  async updateProfile(data: {
    name?: string
    role?: string
  }) {
    return this.request<{ success: boolean }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getUserInterviews() {
    return this.request<Array<{
      id: string
      date: string
      role: string
      duration: string
      overallScore: number
      status: string
    }>>('/user/interviews')
  }

  async getUserStats() {
    return this.request<{
      totalSessions: number
      averageScore: number
      improvementRate: number
      streakDays: number
    }>('/user/stats')
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL)

export default apiClient

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  createInterview,
  getQuestion,
  submitAnswer,
  getInterview,
  endInterview,
  getFeedback,
  generateFeedback,
  getProfile,
  updateProfile,
  getUserInterviews,
  getUserStats,
} = apiClient

// Types for better TypeScript support
export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Interview {
  id: string
  userId: string
  timestamp: string
  roleSelected: string
  config: {
    role: string
    customJobDescription?: string
    interviewType: string
    difficulty: number
    duration: number
    inputMethod: string
  }
  status: 'in-progress' | 'completed'
}

export interface Question {
  id: string
  interviewId: string
  questionText: string
  answerText?: string
  score?: number
  feedback?: string
  type: 'technical' | 'behavioral'
}

export interface Feedback {
  id: string
  interviewId: string
  overallScore: number
  technicalScore: number
  communicationScore: number
  confidenceScore: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  suggestions: string
}
