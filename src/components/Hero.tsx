import React from 'react'

interface HeroProps {
  setCurrentView: (view: 'home' | 'interview' | 'questions') => void
}

const Hero: React.FC<HeroProps> = ({ setCurrentView }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow delay-1000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow delay-500"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="block">Crack Your</span>
            <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Dream Interview
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-dark-muted mb-8 max-w-3xl mx-auto leading-relaxed">
            Practice with AI-powered mock interviews, master coding challenges, and land your dream software engineering role.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => setCurrentView('interview')}
              className="btn-primary text-lg px-8 py-4 group"
            >
              Start Mock Interview
              <svg className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentView('questions')}
              className="btn-secondary text-lg px-8 py-4"
            >
              Browse Questions
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-dark-muted">Interview Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">15+</div>
              <div className="text-gray-600 dark:text-dark-muted">Programming Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-dark-muted">Successful Interviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero