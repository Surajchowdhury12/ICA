import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import InterviewSimulator from './components/InterviewSimulator'
import QuestionBank from './components/QuestionBank'
import Footer from './components/Footer'

function App() {
  const { user, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState<'home' | 'interview' | 'questions'>('home')

  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4 mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />
  }

  // Show app if authenticated
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="relative">
        {currentView === 'home' && (
          <div className="animate-fade-in">
            <Hero setCurrentView={setCurrentView} />
            <Features />
          </div>
        )}
        
        {currentView === 'interview' && (
          <div className="animate-slide-in">
            <InterviewSimulator />
          </div>
        )}
        
        {currentView === 'questions' && (
          <div className="animate-slide-in">
            <QuestionBank />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
