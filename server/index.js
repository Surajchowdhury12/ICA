const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-coach';
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('interview-coach');
    console.log('✅ Connected to MongoDB');
    
    // Create index for faster queries
    await db.collection('questions').createIndex({ category: 1, difficulty: 1, type: 1 });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

connectToMongoDB();

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'gemma3:4b';

// Helper function to call Ollama
async function callOllama(messages, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// GET /api/questions - Get all questions with optional filters
app.get('/api/questions', async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;
    const filter = {};
    
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (type && type !== 'all') filter.type = type;

    const questions = await db.collection('questions').find(filter).toArray();
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/questions - Add a new question
app.post('/api/questions', async (req, res) => {
  try {
    const { question, type, difficulty, category, tags, answer } = req.body;
    
    const result = await db.collection('questions').insertOne({
      question,
      type,
      difficulty,
      category,
      tags,
      answer: answer || '',
      createdAt: new Date()
    });

    res.json({ id: result.insertedId });
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// POST /api/questions/seed - Seed questions from array
app.post('/api/questions/seed', async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions must be an array' });
    }

    const questionsWithTimestamp = questions.map(q => ({
      ...q,
      createdAt: new Date()
    }));

    const result = await db.collection('questions').insertMany(questionsWithTimestamp);
    res.json({ insertedCount: result.insertedCount });
  } catch (err) {
    console.error('Error seeding questions:', err);
    res.status(500).json({ error: 'Failed to seed questions' });
  }
});

// PUT /api/questions/:id - Update a question
app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.collection('questions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/questions/:id - Delete a question
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('questions').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// POST /api/generate-questions - Generate questions using Ollama
app.post('/api/generate-questions', async (req, res) => {
  const { role, level, techStack = '' } = req.body;

  let prompt = `Generate exactly 10 technical interview questions for a ${role} developer at ${level} level`;
  if (techStack && techStack.trim().length > 0) {
    prompt += `, focusing on: ${techStack}`;
  }
  prompt += `. Return ONLY a numbered list (1. 2. 3. ... 10.) with one question per line. No explanations, no text before or after the list.`;

  try {
    console.log(`[Ollama] Generating questions for ${role} at ${level} level...`);
    
    const responseText = await callOllama(
      [
        {
          role: 'system',
          content: 'You are an expert technical interviewer. Generate interview questions exactly as requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      120000 // 120 second timeout for question generation
    );

    // Parse the numbered list
    const lines = responseText.split('\n');
    const questions = lines
      .map(line => {
        const match = line.match(/^\s*\d+\.\s*(.+)/);
        return match ? match[1].trim() : null;
      })
      .filter(q => q && q.length > 10)
      .slice(0, 12);

    console.log(`[Ollama] Generated ${questions.length} questions`);

    if (questions.length > 0) {
      return res.json({ questions });
    } else {
      throw new Error('No questions extracted from response');
    }
  } catch (err) {
    console.error('[Ollama] Question generation failed:', err.message);
    
    // Fallback: return default questions
    const defaultQuestions = [
      "What is your experience with " + role + "?",
      "Tell me about your most challenging project.",
      "How do you approach problem-solving?",
      "Describe your experience with relevant technologies.",
      "What have you learned from your mistakes?",
      "How do you stay updated with new technologies?",
      "Tell me about a time you had to learn something new quickly.",
      "What is your approach to code quality?",
      "How do you handle difficult team members?",
      "What are your career goals?"
    ];
    
    res.json({ questions: defaultQuestions });
  }
});

// POST /api/ai-feedback - Get feedback from Ollama
app.post('/api/ai-feedback', async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  // Handle client abort
  req.on('close', () => {
    if (!res.headersSent) {
      console.log('[Ollama] Client disconnected from feedback request');
    }
  });

  try {
    console.log('[Ollama] Generating feedback for question...');
    
    const feedback = await callOllama(
      [
        {
          role: 'system',
          content: 'You are a senior technical interviewer. Provide constructive feedback on interview answers in 2-3 sentences.'
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nCandidate Answer: ${answer}\n\nProvide brief, actionable feedback (2-3 sentences).`
        }
      ],
      60000 // 60 second timeout for feedback
    );

    console.log('[Ollama] Feedback generated successfully');
    res.json({ feedback });
  } catch (err) {
    console.error('[Ollama] Feedback generation failed:', err.name, err.message);
    
    // Return feedback even on error - use fallback
    const fallbackFeedback = 'Good effort! Your answer shows understanding. Focus on clarity and providing specific examples.';
    console.log('[Ollama] Using fallback feedback');
    res.json({ feedback: fallbackFeedback });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using Ollama at ${OLLAMA_URL} with model: ${OLLAMA_MODEL}`);
});

