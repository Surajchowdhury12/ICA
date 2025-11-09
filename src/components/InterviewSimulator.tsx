import React, { useState } from 'react'

const InterviewSimulator: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('frontend')
  const [selectedLevel, setSelectedLevel] = useState<string>('junior')
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(false)
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)

  const roles = [
    { value: 'frontend', label: 'Frontend Developer', icon: '🎨' },
    { value: 'backend', label: 'Backend Developer', icon: '⚙️' },
    { value: 'fullstack', label: 'Full Stack Developer', icon: '🚀' },
    { value: 'mobile', label: 'Mobile Developer', icon: '📱' },
    { value: 'devops', label: 'DevOps Engineer', icon: '🔧' },
    { value: 'data', label: 'Data Scientist', icon: '📊' }
  ]

  const levels = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' }
  ]

  const mockQuestions = [
    {
      question: "Tell me about yourself and your experience with React.",
      type: "behavioral",
      difficulty: "easy"
    },
    {
      question: "Explain the difference between let, const, and var in JavaScript.",
      type: "technical",
      difficulty: "medium"
    },
    {
      question: "How would you optimize a React application for performance?",
      type: "technical",
      difficulty: "hard"
    }
  ]

  const startInterview = () => {
    setIsInterviewActive(true)
    setCurrentQuestion(0)
  }

  const endInterview = () => {
    setIsInterviewActive(false)
    setCurrentQuestion(0)
  }

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      endInterview()
    }
  }

  if (isInterviewActive) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-dark-bg to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Interview Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Live Interview Session
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {roles.find(r => r.value === selectedRole)?.label} Interview
            </h1>
            <p className="text-gray-400">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="card mb-8 bg-dark-card border-dark-border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                  mockQuestions[currentQuestion].type === 'technical' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                }`}>
                  {mockQuestions[currentQuestion].type === 'technical' ? '💻 Technical' : '🗣️ Behavioral'}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ml-2 ${
                  mockQuestions[currentQuestion].difficulty === 'easy' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : mockQuestions[currentQuestion].difficulty === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {mockQuestions[currentQuestion].difficulty.charAt(0).toUpperCase() + mockQuestions[currentQuestion].difficulty.slice(1)}
                </span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-6">
              {mockQuestions[currentQuestion].question}
            </h2>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Answer:
              </label>
              <textarea
                className="w-full h-32 p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                placeholder="Type your answer here..."
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={endInterview}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                End Interview
              </button>
              <button
                onClick={nextQuestion}
                className="btn-primary"
              >
                {currentQuestion < mockQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mock Interview Simulator
          </h1>
          <p className="text-xl text-gray-600 dark:text-dark-muted">
            Practice with AI-powered interviews tailored to your target role
          </p>
        </div>

        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            Configure Your Interview
          </h2>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Select Role
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === role.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <div className="text-sm font-medium">{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Experience Level
            </label>
            <div className="space-y-3">
              {levels.map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="radio"
                    name="level"
                    value={level.value}
                    checked={selectedLevel === level.value}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interview Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interview Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration: 30-45 minutes
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Questions: 8-12
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-Powered Feedback
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Performance Analytics
              </div>
            </div>
          </div>

          <button
            onClick={startInterview}
            className="w-full btn-primary text-lg py-4"
          >
            Start Mock Interview
          </button>
        </div>
      </div>
    </section>
  )
}

export default InterviewSimulator