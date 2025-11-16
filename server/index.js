const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// POST /api/ai-feedback
app.post('/api/ai-feedback', async (req, res) => {
  const { question, answer } = req.body;
  const HF_API_KEY = process.env.HF_API_KEY;
  const model = 'facebook/bart-large-cnn';

  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Review this interview answer:\nQuestion: ${question}\nAnswer: ${answer}\nFeedback:`
        })
      }
    );
    const data = await response.json();
    let feedback = 'No feedback received.';
    if (Array.isArray(data) && data[0]) {
      if (data[0].summary_text) {
        feedback = data[0].summary_text;
      } else if (data[0].generated_text) {
        feedback = data[0].generated_text;
      }
    }
    res.json({ feedback });
  } catch (err) {
    console.error('AI feedback error:', err);
    res.status(500).json({ error: 'Failed to get AI feedback.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
