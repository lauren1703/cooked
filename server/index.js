/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client (prepare for later recipe generation)
// Using official openai SDK. Ensure OPENAI_API_KEY is set in .env
let openai = null;
try {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (err) {
  console.warn('OpenAI SDK not initialized. Install "openai" and set OPENAI_API_KEY in .env to use it.');
}

// Health/test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Server running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


