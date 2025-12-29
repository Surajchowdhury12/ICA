import axios from 'axios'
import type { Question } from '../data/questionData'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// Get all questions
export const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/questions`)
    return response.data
  } catch (error) {
    console.error('Error fetching questions:', error)
    throw error
  }
}

// Get questions by filters
export const getQuestionsByFilters = async (filters?: {
  category?: string
  difficulty?: string
  type?: string
}): Promise<Question[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.type) params.append('type', filters.type)

    const response = await axios.get(`${API_URL}/api/questions?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching filtered questions:', error)
    throw error
  }
}

// Add a new question
export const addQuestion = async (question: Omit<Question, 'id'>): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/api/questions`, question)
    return response.data.id
  } catch (error) {
    console.error('Error adding question:', error)
    throw error
  }
}

// Update a question
export const updateQuestion = async (id: string, updates: Partial<Question>): Promise<void> => {
  try {
    await axios.put(`${API_URL}/api/questions/${id}`, updates)
  } catch (error) {
    console.error('Error updating question:', error)
    throw error
  }
}

// Delete a question
export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/questions/${id}`)
  } catch (error) {
    console.error('Error deleting question:', error)
    throw error
  }
}

// Seed questions (bulk insert)
export const seedQuestions = async (questions: Question[]): Promise<void> => {
  try {
    await axios.post(`${API_URL}/api/questions/seed`, { questions })
    console.log('Questions seeded successfully')
  } catch (error) {
    console.error('Error seeding questions:', error)
    throw error
  }
}
