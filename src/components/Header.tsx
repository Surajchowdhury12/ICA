import React from 'react'

interface HeaderProps {
  currentView: 'home' | 'interview' | 'questions'
  setCurrentView: (view: 'home' | 'interview' | 'questions') => void
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-dark-bg/80 border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">IC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Interview Cracker</h1>
              <p className="text-xs text-gray-500 dark:text-dark-muted">Master Your Interviews</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'home'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-dark-text hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('interview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'interview'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-dark-text hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card'
              }`}
            >
              Live Interview
            </button>
            <button
              onClick={() => setCurrentView('questions')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'questions'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-dark-text hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card'
              }`}
            >
              Question Bank
            </button>
          </nav>

          {/* Profile */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header