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

// POST /api/generate-questions - Generate questions using Ollama, fallback to MongoDB
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
    
    // Fallback: Fetch from MongoDB based on experience level and role
    try {
      console.log(`[Fallback] Fetching questions from MongoDB for ${role} at ${level} level...`);
      
      // Map experience level to difficulty
      const difficultyMap = {
        'junior': 'easy',
        'mid': 'medium',
        'senior': 'hard'
      };
      
      // Map role to categories in MongoDB
      const roleMap = {
        'frontend': ['React', 'JavaScript', 'Frontend', 'CSS', 'HTML'],
        'backend': ['Backend', 'Node.js', 'Python', 'Java', 'Database', 'API', 'Server'],
        'fullstack': ['React', 'JavaScript', 'Backend', 'Node.js', 'Database', 'Frontend', 'API'],
        'mobile': ['React Native', 'Mobile', 'iOS', 'Android', 'Flutter'],
        'devops': ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'Cloud', 'CI/CD'],
        'data': ['Data Science', 'Python', 'Machine Learning', 'SQL', 'Analytics', 'Data']
      };
      
      const difficulty = difficultyMap[level] || 'easy';
      const categories = roleMap[role] || ['JavaScript', 'Backend'];
      
      // Fetch questions from MongoDB with matching role category and difficulty
      const fallbackQuestions = await db.collection('questions').find({
        difficulty: difficulty,
        type: 'technical',
        category: { $in: categories }
      }).limit(12).toArray();
      
      if (fallbackQuestions.length > 0) {
        // Extract only the question text
        const questionTexts = fallbackQuestions.map(q => q.question);
        console.log(`[Fallback] Fetched ${questionTexts.length} ${role} ${difficulty} questions from MongoDB`);
        return res.json({ questions: questionTexts });
      } else {
        // If no matching role+difficulty, try just difficulty
        console.log(`[Fallback] No ${role} ${difficulty} questions found, fetching any ${difficulty} technical questions...`);
        const anyDifficultyQuestions = await db.collection('questions').find({
          difficulty: difficulty,
          type: 'technical'
        }).limit(12).toArray();
        
        if (anyDifficultyQuestions.length > 0) {
          const questionTexts = anyDifficultyQuestions.map(q => q.question);
          return res.json({ questions: questionTexts });
        } else {
          // If no matching difficulty, fetch any technical questions
          console.log(`[Fallback] No ${difficulty} questions found, fetching any technical questions...`);
          const anyQuestions = await db.collection('questions').find({
            type: 'technical'
          }).limit(12).toArray();
          
          if (anyQuestions.length > 0) {
            const questionTexts = anyQuestions.map(q => q.question);
            return res.json({ questions: questionTexts });
          } else {
            throw new Error('No questions available in MongoDB');
          }
        }
      }
    } catch (fallbackErr) {
      console.error('[Fallback] MongoDB fallback failed:', fallbackErr.message);
      
      // Last resort: return generic default questions
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
  }
});

// POST /api/ai-feedback - Get feedback from Ollama, fallback to MongoDB answer
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
    
    // Fallback: Try to fetch stored answer from MongoDB
    try {
      console.log('[Fallback] Fetching stored answer from MongoDB...');
      
      const storedQuestion = await db.collection('questions').findOne({
        question: question,
        answer: { $exists: true, $ne: '' }
      });
      
      if (storedQuestion && storedQuestion.answer) {
        console.log('[Fallback] Found stored answer in MongoDB');
        return res.json({ 
          feedback: storedQuestion.answer,
          source: 'database'
        });
      }
      
      throw new Error('No stored answer found in MongoDB');
    } catch (fallbackErr) {
      console.error('[Fallback] MongoDB fallback failed:', fallbackErr.message);
      
      // Last resort: return generic default feedback
      const fallbackFeedback = 'Good effort! Your answer shows understanding. Focus on clarity and providing specific examples with relevant details.';
      console.log('[Fallback] Using generic fallback feedback');
      res.json({ 
        feedback: fallbackFeedback,
        source: 'generic'
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using Ollama at ${OLLAMA_URL} with model: ${OLLAMA_MODEL}`);
});

