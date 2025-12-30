import React, { useState, useEffect } from 'react'
import type { Question } from '../data/questionData'
import { getAllQuestions } from '../services/mongoService'

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const categories = ['all', 'javascript', 'react', 'python', 'databases', 'backend', 'security', 'data science', 'machine learning', 'sql', 'analytics', 'system-design', 'tools', 'web', 'general']
  const difficulties = ['all', 'easy', 'medium', 'hard']
  const types = ['all', 'technical', 'behavioral', 'coding']

  // Fetch questions from Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAllQuestions()
        setQuestions(data)
        setFilteredQuestions(data)
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError('Failed to load questions. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  useEffect(() => {
    let filtered = questions

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase())
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.type === selectedType)
    }

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredQuestions(filtered)
  }, [selectedCategory, selectedDifficulty, selectedType, searchTerm, questions])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'hard':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return '💻'
      case 'behavioral':
        return '🗣️'
      case 'coding':
        return '⌨️'
      default:
        return '❓'
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-gray-900 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">Loading questions...</p>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-gray-900 py-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Questions</h2>
          <p className="text-gray-600 dark:text-dark-muted mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Question Bank
          </h1>
          <p className="text-xl text-gray-600 dark:text-dark-muted">
            Practice with our curated collection of interview questions
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Questions
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-dark-muted">
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedDifficulty('all')
                setSelectedType('all')
                setSearchTerm('')
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="card group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(question.type)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-dark-muted">
                  {question.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                {question.question}
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200">
                  View Details
                </button>
                <button className="btn-primary text-sm px-4 py-2">
                  Practice
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No questions found
            </h3>
            <p className="text-gray-600 dark:text-dark-muted">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default QuestionBank