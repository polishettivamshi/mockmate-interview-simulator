"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">MockMate</h1>
            <span className="text-sm text-gray-500">AI Interview Simulator</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Interview Skills with AI
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Practice realistic mock interviews, get instant feedback, and track your progress. 
            Overcome interview anxiety with our AI-powered interview simulator.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Start Practicing Now
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose MockMate?
          </h3>
          <p className="text-lg text-gray-600">
            Everything you need to ace your next interview
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">AI-Powered Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Dynamic questions tailored to your role. Our AI interviewer adapts to your responses 
                and provides realistic interview scenarios.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get detailed feedback on clarity, correctness, and confidence. 
                Identify strengths and areas for improvement immediately.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Monitor your improvement over time with detailed analytics. 
                Track your performance across different interview types.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Voice & Text Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Practice with voice input or text responses. 
                Choose the format that makes you most comfortable.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Role-Specific Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Tailored questions for Software Engineers, Analysts, Managers, 
                and more. Practice for your specific career path.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Anxiety Reduction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Build confidence through repeated practice in a safe environment. 
                Reduce interview anxiety with realistic simulations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Sign Up</h4>
              <p className="text-gray-600">Create your account and set up your profile</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Choose Role</h4>
              <p className="text-gray-600">Select your target role or upload job description</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Practice</h4>
              <p className="text-gray-600">Engage with AI interviewer using voice or text</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Improve</h4>
              <p className="text-gray-600">Get feedback and track your progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Ace Your Next Interview?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of professionals who have improved their interview skills with MockMate
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8 py-3">
              Start Your Free Practice
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <h1 className="text-xl font-bold">MockMate</h1>
            <span className="text-sm text-gray-400">AI Interview Simulator</span>
          </div>
          <p className="text-gray-400">
            © 2024 MockMate. All rights reserved. Practice makes perfect.
          </p>
        </div>
      </footer>
    </div>
  )
}
