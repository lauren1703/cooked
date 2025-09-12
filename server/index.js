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

// Recipe generation endpoint
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const { ingredients, cuisine, targetTime, variations } = req.body;

    // Validate input
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }
    if (!cuisine || typeof cuisine !== 'string') {
      return res.status(400).json({ error: 'Cuisine is required' });
    }
    if (!targetTime || typeof targetTime !== 'number' || targetTime < 5 || targetTime > 120) {
      return res.status(400).json({ error: 'Target time must be between 5 and 120 minutes' });
    }
    if (!variations || typeof variations !== 'number' || variations < 1 || variations > 5) {
      return res.status(400).json({ error: 'Variations must be between 1 and 5' });
    }

    if (!openai) {
      return res.status(500).json({ error: 'OpenAI not configured. Please set OPENAI_API_KEY in .env' });
    }

    const systemPrompt = `You are a professional chef and recipe developer. Generate realistic, home-cookable recipes that follow these STRICT rules:

1. ONLY use the provided ingredients plus common pantry staples: oil, salt, pepper, butter, water, sugar, basic herbs (oregano, basil, thyme, rosemary, parsley, cilantro), flour, eggs, milk, vinegar, lemon juice, garlic powder, onion powder, paprika, cumin, bay leaves.

2. NO exotic, hard-to-find, or fictional ingredients.

3. ONLY use common cooking methods: boil, sauté, bake, roast, grill, steam, stir-fry, simmer, mix, blend, chop, dice, slice.

4. Cooking times must be between 5-120 minutes and realistic for home cooking.

5. ALL ingredients must include specific quantities (e.g., "2 cups pasta", "1 tbsp olive oil").

6. Instructions must be 3-10 clear, numbered steps that a home cook can follow.

7. Recipes must be feasible for home cooking with standard kitchen equipment.

8. Return ONLY valid JSON in this exact format - no markdown, no code fences, no extra text:

{
  "recipes": [
    {
      "id": "slug-string",
      "name": "Recipe Name",
      "type": "quick|full|creative",
      "cuisine": "Cuisine Type",
      "cookingTimeMinutes": 30,
      "difficulty": "Easy|Medium|Hard",
      "ingredients": ["1 cup ingredient", "2 tbsp another ingredient"],
      "instructions": ["Step 1 instruction", "Step 2 instruction"]
    }
  ]
}`;

    const userPrompt = `Generate ${variations} ${cuisine} recipes using these ingredients: ${ingredients.join(', ')}. Target cooking time: ${targetTime} minutes.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content;
    
    // Clean response - remove code fences if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse and validate JSON
    let recipeData;
    try {
      recipeData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return res.status(500).json({ error: 'Recipe generation failed - invalid response format' });
    }

    // Validate response structure
    if (!recipeData.recipes || !Array.isArray(recipeData.recipes)) {
      console.error('Invalid response structure:', recipeData);
      return res.status(500).json({ error: 'Recipe generation failed - invalid response structure' });
    }

    // Validate each recipe has required fields
    for (const recipe of recipeData.recipes) {
      if (!recipe.id || !recipe.name || !recipe.type || !recipe.cuisine || 
          !recipe.cookingTimeMinutes || !recipe.difficulty || 
          !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
        console.error('Invalid recipe structure:', recipe);
        return res.status(500).json({ error: 'Recipe generation failed - invalid recipe structure' });
      }
    }

    res.json(recipeData);

  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({ error: 'Recipe generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


