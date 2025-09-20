require('dotenv').config();
console.log('OpenAI API key loaded:', !!process.env.OPENAI_API_KEY);
console.log('Claude API key loaded:', !!process.env.ANTHROPIC_API_KEY);
console.log('OpenAI key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'undefined');
console.log('Claude key starts with:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'undefined');
