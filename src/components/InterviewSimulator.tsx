import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const InterviewSimulator: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('frontend')
  const [selectedLevel, setSelectedLevel] = useState<string>('junior')
  const [selectedTechStack, setSelectedTechStack] = useState<string>('')
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(false)
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [aiFeedback, setAIFeedback] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [questions, setQuestions] = useState<string[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false)
  const [feedbackProgress, setFeedbackProgress] = useState<number>(0)
  const [usedFallback, setUsedFallback] = useState<boolean>(false)
  const [storedAnswers, setStoredAnswers] = useState<string[]>([])
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false)

  // Call backend API for feedback (non-blocking, background)
  async function getAIReview(question: string, answer: string, questionIdx: number) {
    if (!question || !answer) return;
    
    try {
      // If using fallback, use stored answer as feedback
      if (usedFallback && storedAnswers[questionIdx]) {
        setAIFeedback((prev) => {
          const updated = [...prev];
          updated[questionIdx] = storedAnswers[questionIdx];
          return updated;
        });
        setFeedbackProgress((prev) => prev + 1);
        return;
      }

      // Otherwise, try to get AI feedback
      const response = await fetch(`${API_URL}/api/ai-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question, answer })
      });
      
      const data = await response.json();
      setAIFeedback((prev) => {
        const updated = [...prev];
        updated[questionIdx] = data.feedback || "Feedback unavailable.";
        return updated;
      });
      
      // Update progress
      setFeedbackProgress((prev) => prev + 1);
    } catch (err) {
      console.error('Feedback error:', err);
      // Update progress even on error
      setFeedbackProgress((prev) => prev + 1);
    }
  }

  // Web Speech API - Speak the question
  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; // Normal speed
      utterance.pitch = 1; // Normal pitch
      utterance.volume = 1; // Full volume

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser');
    }
  }
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

  // Fetch questions from backend API with fallback to MongoDB
  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      // Try to fetch from AI first
      const response = await fetch(`${API_URL}/api/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: selectedRole,
          level: selectedLevel,
          techStack: selectedTechStack
        })
      });
      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        // Successfully got AI questions
        setQuestions(data.questions);
        setUsedFallback(false);
      } else {
        throw new Error('No AI questions generated');
      }
    } catch (err) {
      console.error('Error fetching AI questions, falling back to MongoDB:', err);
      
      // Fallback: Fetch from MongoDB
      try {
        const fallbackResponse = await fetch(`${API_URL}/api/questions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        const fallbackData = await fallbackResponse.json();
        
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          // Shuffle and select random 10-15 questions from DB
          const shuffled = fallbackData.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, Math.min(12, shuffled.length));
          
          setQuestions(selected.map(q => q.question));
          setStoredAnswers(selected.map(q => q.answer || ''));
          setUsedFallback(true);
          
          console.log('Using fallback questions from MongoDB');
        } else {
          throw new Error('No fallback questions available');
        }
      } catch (fallbackErr) {
        console.error('Error fetching fallback questions:', fallbackErr);
        alert('Failed to fetch questions from both AI and database. Please ensure the server is running.');
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  }


  const startInterview = async () => {
    setIsInterviewActive(true)
    setCurrentQuestion(0)
    setUserAnswers([])
    setCurrentAnswer("")
    setAIFeedback([])
    setStoredAnswers([])
    setUsedFallback(false)
    await fetchQuestions()
  }


  const endInterview = () => {
    setShowExitConfirm(true)
  }

  const confirmExit = () => {
    setShowExitConfirm(false)
    setIsInterviewActive(false)
    setShowSummary(false)
    setCurrentQuestion(0)
    setUserAnswers([])
    setCurrentAnswer('')
    setAIFeedback([])
    setStoredAnswers([])
    setUsedFallback(false)
    setQuestions([])
  }

  const cancelExit = () => {
    setShowExitConfirm(false)
  }


  const nextQuestion = async () => {
    // Save current answer
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestion] = currentAnswer;
    setUserAnswers(updatedAnswers);
    
    // Capture answer and question before clearing state
    const answerToSubmit = currentAnswer;
    const questionToSubmit = questions[currentQuestion];
    const questionIdx = currentQuestion;
    
    // Move to next question
    setCurrentAnswer("");
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show loading screen for feedback generation
      setIsGeneratingFeedback(true);
      setIsInterviewActive(false);
      setFeedbackProgress(0);
    }
    
    // Get feedback for this answer in background (don't wait)
    getAIReview(questionToSubmit, answerToSubmit, questionIdx);
  }

  // Auto-transition to summary when feedback is complete
  React.useEffect(() => {
    if (!isGeneratingFeedback) return;
    
    const allFeedbackGenerated = aiFeedback.filter(f => f && f.trim().length > 0).length === questions.length;
    
    if (allFeedbackGenerated) {
      const timer = setTimeout(() => {
        setShowSummary(true);
        setIsGeneratingFeedback(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    // Timeout after 2 minutes
    const timeoutTimer = setTimeout(() => {
      setShowSummary(true);
      setIsGeneratingFeedback(false);
    }, 120000);
    
    return () => clearTimeout(timeoutTimer);
  }, [isGeneratingFeedback, aiFeedback, questions.length]);

  if (isInterviewActive) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-dark-bg to-gray-900 py-8">
        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-card border border-dark-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Exit Interview?</h2>
                <p className="text-gray-400">Your progress will not be saved if you exit now.</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelExit}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Continue Interview
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}

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
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0}%` }}
            ></div>
          </div>

          {/* Loading Questions */}
          {isLoadingQuestions ? (
            <div className="card mb-8 bg-dark-card border-dark-border text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-300">Loading interview questions...</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="card mb-8 bg-dark-card border-dark-border text-center py-12">
              <p className="text-gray-300">No questions available. Please try again.</p>
            </div>
          ) : (
            <>
              {/* Question Card */}
              <div className="card mb-8 bg-dark-card border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-6">
                  {questions[currentQuestion]}
                </h2>

                <button
                  onClick={() => speakQuestion(questions[currentQuestion])}
                  disabled={isSpeaking}
                  className={`mb-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isSpeaking
                      ? 'bg-primary-600 text-white cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  <span className="text-lg">{isSpeaking ? '🔊' : '🔈'}</span>
                  {isSpeaking ? 'Playing...' : 'Play Question Audio'}
                </button>

                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Answer:
                  </label>
                  <textarea
                    className="w-full h-32 p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    disabled={isGeneratingFeedback}
                  />
                </div>

                {aiFeedback[currentQuestion] ? (
                  <div className="bg-blue-900/30 text-blue-200 rounded-lg p-4 mb-6">
                    <strong>✓ IC Feedback:</strong>
                    <div className="mt-2">{aiFeedback[currentQuestion]}</div>
                  </div>
                ) : currentQuestion > 0 && userAnswers[currentQuestion - 1] ? (
                  <div className="bg-blue-900/30 text-blue-200 rounded-lg p-4 mb-6 animate-pulse">
                    <strong>⏳ Generating feedback for previous answer...</strong>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <button
                    onClick={endInterview}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                    disabled={isGeneratingFeedback}
                  >
                    End Interview
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="btn-primary"
                    disabled={isGeneratingFeedback || !currentAnswer.trim()}
                  >
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    )
  }

  // Feedback Generation Screen
  if (isGeneratingFeedback && !showSummary) {
    const allFeedbackGenerated = aiFeedback.filter(f => f && f.trim().length > 0).length === questions.length;
    
    return (
      <section className="min-h-screen bg-gradient-to-br from-dark-bg to-gray-900 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card bg-dark-card border-dark-border p-12">
            <div className="mb-8">
              <div className="inline-block">
                {!allFeedbackGenerated ? (
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mb-6"></div>
                ) : (
                  <div className="text-6xl mb-6">✓</div>
                )}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              {allFeedbackGenerated ? '✓ Interview Complete!' : 'Generating Feedback'}
            </h2>
            
            <p className="text-gray-300 mb-8 text-lg">
              {allFeedbackGenerated 
                ? 'All feedback has been generated. Preparing your summary...' 
                : `Processing your answers...\n${feedbackProgress} of ${questions.length} feedbacks generated`}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${questions.length > 0 ? (feedbackProgress / questions.length) * 100 : 0}%` }}
              ></div>
            </div>

            <p className="text-gray-400 text-sm">
              {feedbackProgress}/{questions.length} feedbacks ready
            </p>

            {allFeedbackGenerated && (
              <div className="mt-8 text-sm text-gray-400 animate-pulse">
                Redirecting to summary...
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (showSummary) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-dark-bg to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Interview Summary</h1>
            <p className="text-gray-400">See your answers and feedback below.</p>
          </div>

          {/* Fallback Banner */}
          {usedFallback && (
            <div className="mb-8 bg-blue-900/30 border border-blue-600 text-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-xl mr-3">ℹ️</span>
                <div>
                  <strong>Questions from Database</strong>
                  <p className="text-sm mt-1">Since the AI service was unavailable, questions were loaded from our question database. The answers shown below are reference answers from our database.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={idx} className="card bg-dark-card border-dark-border p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Q{idx + 1}: {q}</h2>
                
                <div className="mb-4">
                  <span className="font-medium text-gray-300 block mb-2">Your Answer:</span>
                  <div className="bg-gray-800 text-white rounded p-3 border border-gray-700">
                    {userAnswers[idx] || <em className="text-gray-400">No answer provided</em>}
                  </div>
                </div>

                <div>
                  <span className="font-medium block mb-2">
                    {usedFallback ? (
                      <span className="text-blue-200">Reference Answer:</span>
                    ) : (
                      <span className="text-blue-200">AI Feedback:</span>
                    )}
                  </span>
                  <div className="bg-blue-900/30 text-blue-200 rounded p-3 border border-blue-600/30">
                    {aiFeedback[idx] || storedAnswers[idx] || <em className="text-gray-400">No feedback available</em>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => {
                setShowSummary(false);
                startInterview();
              }}
              className="btn-primary px-8 py-3 text-lg"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </section>
    );
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
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Tech Stack (Optional)
            </label>
            <input
              type="text"
              value={selectedTechStack}
              onChange={(e) => setSelectedTechStack(e.target.value)}
              placeholder="e.g., React, JavaScript, TypeScript, CSS"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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