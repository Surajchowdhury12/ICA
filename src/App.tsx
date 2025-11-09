import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import InterviewSimulator from './components/InterviewSimulator'
import QuestionBank from './components/QuestionBank'
import Footer from './components/Footer'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'interview' | 'questions'>('home')

  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

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
