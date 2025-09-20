/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();
console.log("✅ API key loaded?", !!process.env.OPENAI_API_KEY);

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

8. CRITICAL: Each recipe variation must be COMPLETELY DIFFERENT from the others:
   - Use different cooking methods (stir-fry vs. baked vs. one-pot)
   - Create different dish types (soup vs. salad vs. pasta vs. casserole)
   - Vary the flavor profiles and seasonings significantly
   - Use different combinations of the provided ingredients
   - Include different pantry staples for each recipe
   - Make instructions completely unique, not just reworded versions

9. Return ONLY valid JSON in this exact format - no markdown, no code fences, no extra text:

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

    let responseText;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {role: 'user', 
            content: `Create ${variations} COMPLETELY DIFFERENT ${cuisine} recipes using these ingredients: ${ingredients.join(', ')}.
            
            Target cooking time: ${targetTime} minutes.
            
            REQUIREMENTS FOR DIVERSITY:
            - Recipe 1: Use a stir-fry or sauté method, create a main dish
            - Recipe 2: Use baking or roasting method, create a different dish type (soup, salad, casserole, etc.)
            - Recipe 3: Use a one-pot or simmering method, create yet another dish type
            
            Each recipe must have:
            - Different cooking techniques
            - Different dish categories (main course, soup, salad, pasta, etc.)
            - Different flavor profiles and seasonings
            - Different ingredient combinations and quantities
            - Completely unique step-by-step instructions
            
            Make each recipe feel like a completely different meal, not just variations of the same dish.` 
        }
        ],
        temperature: 0.8,     // keeps output realistic
        top_p: 0.95,
        max_tokens: 2000,
        response_format: { type: "json_object" }  // <-- force JSON
      });

      responseText = completion.choices[0].message.content;

    } catch (apiError) {
      console.error("🔥 OpenAI API error:", apiError.response ? apiError.response.data : apiError.message);
    
      // Generate fallback recipes if API call fails
      console.log("🔄 Using fallback recipe generation...");
      const fallbackRecipes = generateFallbackRecipes(ingredients, cuisine, targetTime, variations);
      return res.json({ recipes: fallbackRecipes });
    }
    
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

// Function to generate fallback recipes when the OpenAI API is unavailable
function generateFallbackRecipes(ingredients, cuisine, targetTime, variations) {
  const recipes = [];
  const types = ['quick', 'full', 'creative'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  
  // Define different cooking methods and dish types for variety
  const cookingMethods = [
    {
      name: 'Stir-fry',
      instructions: [
        'Heat oil in a large wok or skillet over high heat.',
        'Add ingredients in order of cooking time (hardest first).',
        'Stir constantly for even cooking.',
        'Add sauce and toss to combine.',
        'Serve immediately over rice or noodles.'
      ]
    },
    {
      name: 'One-pot',
      instructions: [
        'Heat oil in a large pot over medium heat.',
        'Add aromatics and cook until fragrant.',
        'Add main ingredients and liquid.',
        'Bring to a boil, then reduce heat and simmer.',
        'Cook until all ingredients are tender.',
        'Season to taste and serve hot.'
      ]
    },
    {
      name: 'Baked',
      instructions: [
        'Preheat oven to 375°F (190°C).',
        'Prepare ingredients and place in baking dish.',
        'Drizzle with oil and seasonings.',
        'Cover with foil and bake for 20 minutes.',
        'Remove foil and bake until golden brown.',
        'Let rest for 5 minutes before serving.'
      ]
    }
  ];
  
  // Generate the requested number of recipe variations
  for (let i = 0; i < variations; i++) {
    const id = `fallback-${i + 1}`;
    const type = types[i % types.length];
    const difficulty = difficulties[i % difficulties.length];
    const cookingMethod = cookingMethods[i % cookingMethods.length];
    const cookingTimeMinutes = Math.min(Math.max(targetTime - 5 + (i * 10), 10), 120);
    
    // Create a recipe name with more variety
    const mainIngredient = ingredients[0] || 'Mixed';
    const dishTypes = ['Bowl', 'Skillet', 'Casserole', 'Salad', 'Soup', 'Pasta', 'Wrap'];
    const dishType = dishTypes[i % dishTypes.length];
    const recipeName = `${cuisine} ${mainIngredient} ${dishType}`;
    
    // Generate different ingredient quantities and add different pantry staples
    const recipeIngredients = [];
    const pantryStaples = [
      ['1 tablespoon olive oil', 'Salt and pepper to taste'],
      ['2 tablespoons butter', '1 clove garlic, minced', 'Salt and pepper to taste'],
      ['1 tablespoon vegetable oil', '1 teaspoon dried oregano', 'Salt and pepper to taste'],
      ['2 tablespoons olive oil', '1 tablespoon lemon juice', 'Salt and pepper to taste']
    ];
    
    // Add main ingredients with varied quantities
    ingredients.forEach((ingredient, index) => {
      const quantities = [1, 2, 3];
      const units = ['cup', 'tablespoon', 'teaspoon', 'piece', 'pound', 'ounce'];
      const quantity = quantities[index % quantities.length];
      const unit = units[index % units.length];
      const unitText = quantity > 1 ? `${unit}s` : unit;
      recipeIngredients.push(`${quantity} ${unitText} of ${ingredient}`);
    });
    
    // Add different pantry staples for each recipe
    const selectedPantry = pantryStaples[i % pantryStaples.length];
    recipeIngredients.push(...selectedPantry);
    
    // Generate varied instructions based on cooking method
    const instructions = cookingMethod.instructions.map((step, stepIndex) => {
      if (stepIndex === 1) { // Customize the aromatics step
        const aromatics = ['onion', 'garlic', 'ginger', 'bell pepper'];
        const selectedAromatic = aromatics[i % aromatics.length];
        return `Add ${selectedAromatic} and cook until fragrant.`;
      } else if (stepIndex === 2) { // Customize the main cooking step
        const mainIngredient = ingredients[0] || 'main ingredients';
        return `Add ${mainIngredient} and cook for ${Math.floor(cookingTimeMinutes / 4)} minutes.`;
      } else if (stepIndex === 3) { // Customize the liquid/sauce step
        const liquids = ['broth', 'wine', 'tomato sauce', 'coconut milk'];
        const selectedLiquid = liquids[i % liquids.length];
        return `Add ${selectedLiquid} and bring to a simmer.`;
      }
      return step;
    });
    
    recipes.push({
      id,
      name: recipeName,
      type,
      cuisine,
      cookingTimeMinutes,
      difficulty,
      ingredients: recipeIngredients,
      instructions
    });
  }
  
  return recipes;
}

app.listen(PORT, () => {
  console.log(`Server listening on 
    http://localhost:${PORT}`);
});


