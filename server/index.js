/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();
console.log("✅ OpenAI API key loaded?", !!process.env.OPENAI_API_KEY);
console.log("✅ Claude API key loaded?", !!process.env.ANTHROPIC_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI providers
let openai = null;
let anthropic = null;

// Initialize OpenAI client
try {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (err) {
  console.warn('OpenAI SDK not initialized. Install "openai" and set OPENAI_API_KEY in .env to use it.');
}

// Initialize Claude client
try {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} catch (err) {
  console.warn('Claude SDK not initialized. Install "@anthropic-ai/sdk" and set ANTHROPIC_API_KEY in .env to use it.');
}

// Health/test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Server running' });
});

// Helper function to detect ingredient types and suggest appropriate recipe categories
function analyzeIngredients(ingredients) {
  const fruits = ['apple', 'banana', 'blueberry', 'strawberry', 'lemon', 'lime', 'orange', 'grape', 'cherry', 'peach', 'pear', 'plum', 'raspberry', 'blackberry', 'cranberry', 'mango', 'pineapple', 'kiwi', 'grapefruit', 'pomegranate', 'fig', 'date', 'coconut'];
  const vegetables = ['tomato', 'onion', 'garlic', 'carrot', 'celery', 'pepper', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'potato', 'sweet potato', 'zucchini', 'eggplant', 'mushroom', 'cabbage', 'cauliflower', 'asparagus', 'corn', 'peas', 'beans'];
  const proteins = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'eggs', 'tofu', 'lamb', 'turkey', 'duck', 'bacon', 'sausage', 'ham'];
  const grains = ['rice', 'pasta', 'bread', 'quinoa', 'oats', 'barley', 'wheat', 'flour', 'noodles'];
  const dairy = ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'sour cream', 'cream cheese'];
  
  const detectedTypes = {
    fruits: ingredients.filter(ing => fruits.some(fruit => ing.toLowerCase().includes(fruit))),
    vegetables: ingredients.filter(ing => vegetables.some(veg => ing.toLowerCase().includes(veg))),
    proteins: ingredients.filter(ing => proteins.some(prot => ing.toLowerCase().includes(prot))),
    grains: ingredients.filter(ing => grains.some(grain => ing.toLowerCase().includes(grain))),
    dairy: ingredients.filter(ing => dairy.some(d => ing.toLowerCase().includes(d)))
  };
  
  // Determine primary ingredient type and suggest recipe categories
  const totalFruits = detectedTypes.fruits.length;
  const totalVegetables = detectedTypes.vegetables.length;
  const totalProteins = detectedTypes.proteins.length;
  
  let recipeCategories = [];
  let dishType = 'main course';
  
  if (totalFruits > 0 && totalFruits >= totalVegetables && totalFruits >= totalProteins) {
    recipeCategories = ['dessert', 'smoothie', 'fruit salad', 'baked goods', 'breakfast'];
    dishType = 'sweet/fruit-based';
  } else if (totalVegetables > 0 && totalVegetables >= totalProteins) {
    recipeCategories = ['salad', 'soup', 'stir-fry', 'roasted vegetables', 'vegetarian main'];
    dishType = 'vegetable-based';
  } else if (totalProteins > 0) {
    recipeCategories = ['main course', 'grilled', 'braised', 'stir-fry', 'one-pot'];
    dishType = 'protein-based';
  } else {
    recipeCategories = ['main course', 'side dish', 'appetizer', 'soup', 'salad'];
    dishType = 'general';
  }
  
  return {
    detectedTypes,
    recipeCategories,
    dishType,
    primaryType: totalFruits > totalVegetables && totalFruits > totalProteins ? 'fruits' : 
                 totalVegetables > totalProteins ? 'vegetables' : 'proteins'
  };
}

// Recipe generation endpoint with multiple AI providers and validation
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

    // Analyze ingredients to determine appropriate recipe types
    const ingredientAnalysis = analyzeIngredients(ingredients);
    console.log('🔍 Ingredient analysis:', ingredientAnalysis);

    // Try multiple AI providers in order of preference
    let recipeData = null;
    let usedProvider = 'fallback';

    // Try Claude first (often better for creative tasks)
    if (anthropic) {
      try {
        console.log('🤖 Attempting recipe generation with Claude...');
        recipeData = await generateRecipesWithClaude(ingredients, cuisine, targetTime, variations, ingredientAnalysis);
        usedProvider = 'claude';
        console.log('✅ Claude recipe generation successful');
      } catch (claudeError) {
        console.error('🔥 Claude API error:', claudeError.message);
      }
    }

    // Try OpenAI if Claude failed
    if (!recipeData && openai) {
      try {
        console.log('🤖 Attempting recipe generation with OpenAI...');
        recipeData = await generateRecipesWithOpenAI(ingredients, cuisine, targetTime, variations);
        usedProvider = 'openai';
        console.log('✅ OpenAI recipe generation successful');
      } catch (openaiError) {
        console.error('🔥 OpenAI API error:', openaiError.message);
      }
    }

    // Use fallback if both AI providers failed
    if (!recipeData) {
      console.log('🔄 Using fallback recipe generation...');
      recipeData = { recipes: generateFallbackRecipes(ingredients, cuisine, targetTime, variations, ingredientAnalysis) };
      usedProvider = 'fallback';
    }

    // Validate and enhance recipes with AI validation
    if (recipeData && recipeData.recipes) {
      console.log('🔍 Validating recipes with AI...');
      const validatedRecipes = await validateRecipesWithAI(recipeData.recipes, ingredients, targetTime);
      recipeData.recipes = validatedRecipes;
    }

    // Add metadata about generation
    recipeData.metadata = {
      provider: usedProvider,
      timestamp: new Date().toISOString(),
      validation: 'ai-enhanced'
    };

    res.json(recipeData);

  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({ error: 'Recipe generation failed' });
  }
});

// Enhanced AI recipe generation functions
async function generateRecipesWithClaude(ingredients, cuisine, targetTime, variations, ingredientAnalysis) {
  const { recipeCategories, dishType, primaryType } = ingredientAnalysis;
  
  let systemPrompt = `You are a world-class chef and recipe developer with expertise in ${cuisine} cuisine. Create sophisticated, restaurant-quality recipes that are both creative and practical for home cooking.

CRITICAL REQUIREMENTS:
1. Use ONLY the provided ingredients plus common pantry staples (oil, salt, pepper, butter, water, basic herbs, flour, eggs, vinegar, lemon, garlic, onion, spices)
2. Each recipe must be COMPLETELY DIFFERENT with unique cooking methods, flavor profiles, and techniques
3. Cooking times must be realistic and achievable for home cooks
4. Include specific quantities, temperatures, and timing for all steps
5. Use professional cooking techniques: searing, braising, roasting, grilling, sautéing, etc.
6. Add sophisticated touches like proper seasoning, visual cues, and presentation tips`;

  // Add specific guidance based on ingredient type
  if (primaryType === 'fruits') {
    systemPrompt += `

SPECIAL FRUIT INGREDIENT GUIDANCE:
- These are FRUITS, so create appropriate sweet/fruity recipes
- Focus on: desserts, smoothies, fruit salads, baked goods, breakfast items, fruit-based sauces
- Use techniques like: baking, blending, macerating, poaching, grilling fruits
- Create recipes like: fruit tarts, smoothie bowls, fruit compotes, fruit crumbles, fruit salads
- Avoid treating fruits as vegetables in savory dishes`;
  } else if (primaryType === 'vegetables') {
    systemPrompt += `

SPECIAL VEGETABLE INGREDIENT GUIDANCE:
- These are VEGETABLES, so create appropriate savory recipes
- Focus on: salads, soups, stir-fries, roasted vegetables, vegetarian mains
- Use techniques like: roasting, sautéing, steaming, grilling, braising
- Create recipes like: vegetable stir-fries, roasted vegetable medleys, vegetable soups, fresh salads`;
  }

  systemPrompt += `

Return ONLY valid JSON in this exact format:
{
  "recipes": [
    {
      "id": "unique-slug",
      "name": "Recipe Name",
      "type": "quick|full|creative",
      "cuisine": "Cuisine Type",
      "cookingTimeMinutes": 30,
      "difficulty": "Easy|Medium|Hard",
      "ingredients": ["1 cup ingredient", "2 tbsp another ingredient"],
      "instructions": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}`;

  let userPrompt = `Create ${variations} sophisticated ${cuisine} recipes using these ingredients: ${ingredients.join(', ')}. Target cooking time: ${targetTime} minutes.

INGREDIENT ANALYSIS:
- Primary ingredient type: ${primaryType}
- Suggested recipe categories: ${recipeCategories.join(', ')}
- Dish type: ${dishType}

Make each recipe completely unique with different:
- Cooking methods (braise vs grill vs stir-fry vs roast)
- Flavor profiles (spicy vs mild vs tangy vs rich)
- Dish types (hearty vs light vs creamy vs crispy)
- Techniques and presentation styles`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const responseText = response.content[0].text;
  const cleanedResponse = responseText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleanedResponse);
}

async function generateRecipesWithOpenAI(ingredients, cuisine, targetTime, variations) {
  const systemPrompt = `You are a professional chef and recipe developer. Generate sophisticated, restaurant-quality recipes that follow these STRICT rules:

1. ONLY use the provided ingredients plus common pantry staples: oil, salt, pepper, butter, water, sugar, basic herbs (oregano, basil, thyme, rosemary, parsley, cilantro), flour, eggs, milk, vinegar, lemon juice, garlic powder, onion powder, paprika, cumin, bay leaves, wine, broth, cream, cheese, nuts, seeds.

2. NO exotic, hard-to-find, or fictional ingredients.

3. Use sophisticated cooking methods: braise, sear, deglaze, reduce, caramelize, confit, poach, roast, grill, stir-fry, simmer, steam, sauté, bake, broil.

4. Cooking times must be between 5-120 minutes and realistic for home cooking.

5. ALL ingredients must include specific quantities (e.g., "2 cups pasta", "1 tbsp olive oil", "1/2 cup dry white wine").

6. Instructions must be 6-12 detailed, professional steps that include:
   - Specific temperatures and cooking times
   - Visual cues (golden brown, shimmering oil, etc.)
   - Proper techniques (searing, deglazing, reducing)
   - Seasoning adjustments and tasting
   - Garnishing and presentation tips

7. Recipes must be feasible for home cooking with standard kitchen equipment.

8. CRITICAL: Each recipe variation must be COMPLETELY DIFFERENT from the others:
   - Use different cooking methods and techniques
   - Create different dish types and presentations
   - Vary the flavor profiles and seasoning approaches
   - Use different combinations of the provided ingredients
   - Include different pantry staples and seasonings for each recipe
   - Make instructions completely unique with different techniques and timing
   - Vary complexity levels and preparation methods

9. Add sophisticated touches like:
   - Proper seasoning and tasting steps
   - Visual and texture descriptions
   - Professional plating suggestions
   - Flavor balancing techniques

10. Return ONLY valid JSON in this exact format - no markdown, no code fences, no extra text:

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

  const userPrompt = `Create ${variations} SOPHISTICATED, COMPLETELY DIFFERENT ${cuisine} recipes using these ingredients: ${ingredients.join(', ')}.
            
Target cooking time: ${targetTime} minutes.
            
REQUIREMENTS FOR MAXIMUM DIVERSITY AND CREATIVITY:
- Each recipe should showcase completely different cooking approaches and styles
- Explore various cooking techniques, flavor profiles, and presentation methods
- Be creative with ingredient combinations and cooking methods
- Vary the complexity, texture, and visual appeal of each dish
- Use professional techniques that highlight the unique qualities of the ingredients
            
Each recipe must have:
- Unique cooking techniques and methods (choose from any appropriate techniques)
- Distinct dish categories and styles (be creative with presentation and concept)
- Different flavor profiles and seasoning approaches (explore various culinary traditions)
- Creative ingredient combinations and sophisticated seasonings
- 6-15 detailed professional steps with specific techniques
- Visual cues, temperature guidance, and timing details
- Professional finishing touches and garnishing suggestions
            
Make each recipe feel like it came from a different restaurant kitchen with unique techniques, flavors, and presentation styles.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    top_p: 0.95,
    max_tokens: 3000,
    response_format: { type: "json_object" }
  });

  const responseText = completion.choices[0].message.content;
  const cleanedResponse = responseText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleanedResponse);
}

// AI-powered recipe validation function
async function validateRecipesWithAI(recipes, userIngredients, targetTime) {
  if (!openai && !anthropic) {
    console.log('⚠️ No AI providers available for validation, returning original recipes');
    return recipes;
  }

  const validationPrompt = `You are a professional chef and recipe validator. Analyze these recipes for accuracy, feasibility, and quality. For each recipe, check:

1. COOKING TIME VALIDATION:
   - Are the cooking times realistic for the techniques used?
   - Do prep time + cook time = total time?
   - Are there any impossible time combinations?

2. INGREDIENT COMBINATION VALIDATION:
   - Do the ingredient combinations make culinary sense?
   - Are there any conflicting flavors or textures?
   - Are the quantities proportional and realistic?

3. TECHNIQUE VALIDATION:
   - Are the cooking techniques appropriate for the ingredients?
   - Do the instructions follow proper cooking sequences?
   - Are temperatures and methods correctly specified?

4. FEASIBILITY VALIDATION:
   - Can this be made with standard home kitchen equipment?
   - Are all ingredients accessible to home cooks?
   - Is the difficulty level appropriate for the techniques?

For each recipe, provide:
- Overall validation score (1-10)
- Specific issues found (if any)
- Suggested improvements
- Confirmed accuracy of cooking times and techniques

Return ONLY valid JSON in this format:
{
  "validatedRecipes": [
    {
      "id": "recipe-id",
      "validationScore": 8,
      "issues": ["minor issue 1", "minor issue 2"],
      "improvements": ["suggestion 1", "suggestion 2"],
      "isValid": true,
      "cookingTimeAccuracy": "accurate|slightly-off|needs-adjustment",
      "techniqueAccuracy": "excellent|good|needs-work"
    }
  ]
}`;

  try {
    let response;
    if (anthropic) {
      response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        system: validationPrompt,
        messages: [{ 
          role: 'user', 
          content: `Validate these recipes:\n\n${JSON.stringify(recipes, null, 2)}\n\nUser ingredients: ${userIngredients.join(', ')}\nTarget time: ${targetTime} minutes` 
        }]
      });
      const responseText = response.content[0].text;
      const cleanedResponse = responseText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const validationResult = JSON.parse(cleanedResponse);
      
      // Apply validation results to recipes
      return recipes.map(recipe => {
        const validation = validationResult.validatedRecipes.find(v => v.id === recipe.id);
        if (validation) {
          return {
            ...recipe,
            validation: {
              score: validation.validationScore,
              issues: validation.issues || [],
              improvements: validation.improvements || [],
              isValid: validation.isValid,
              cookingTimeAccuracy: validation.cookingTimeAccuracy,
              techniqueAccuracy: validation.techniqueAccuracy
            }
          };
        }
        return recipe;
      });
    } else if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: validationPrompt },
          { role: 'user', content: `Validate these recipes:\n\n${JSON.stringify(recipes, null, 2)}\n\nUser ingredients: ${userIngredients.join(', ')}\nTarget time: ${targetTime} minutes` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });
      
      const responseText = completion.choices[0].message.content;
      const cleanedResponse = responseText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const validationResult = JSON.parse(cleanedResponse);
      
      // Apply validation results to recipes
      return recipes.map(recipe => {
        const validation = validationResult.validatedRecipes.find(v => v.id === recipe.id);
        if (validation) {
          return {
            ...recipe,
            validation: {
              score: validation.validationScore,
              issues: validation.issues || [],
              improvements: validation.improvements || [],
              isValid: validation.isValid,
              cookingTimeAccuracy: validation.cookingTimeAccuracy,
              techniqueAccuracy: validation.techniqueAccuracy
            }
          };
        }
        return recipe;
      });
    }
  } catch (error) {
    console.error('Recipe validation error:', error);
    return recipes; // Return original recipes if validation fails
  }
  
  return recipes;
}

// Function to generate fallback recipes when the OpenAI API is unavailable
function generateFallbackRecipes(ingredients, cuisine, targetTime, variations, ingredientAnalysis) {
  const recipes = [];
  const types = ['quick', 'full', 'creative'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const { primaryType, recipeCategories } = ingredientAnalysis;
  
  // Define different cooking methods and dish types for variety
  let cookingMethods = [];
  
  if (primaryType === 'fruits') {
    cookingMethods = [
      {
        name: 'Smoothie Bowl',
        instructions: [
          'Add all fruits to a high-powered blender with a splash of liquid (milk, yogurt, or juice).',
          'Blend on high speed for 60-90 seconds until completely smooth and creamy.',
          'Taste and adjust sweetness with honey or maple syrup if needed.',
          'Pour into a bowl and add toppings like granola, nuts, seeds, or coconut flakes.',
          'Serve immediately while cold and fresh.',
          'Garnish with fresh fruit slices and a drizzle of honey for presentation.'
        ]
      },
      {
        name: 'Fruit Crumble',
        instructions: [
          'Preheat oven to 375°F (190°C) and prepare a baking dish.',
          'Mix fruits with sugar, lemon juice, and a pinch of salt in a large bowl.',
          'Let the fruit mixture macerate for 15 minutes to release juices.',
          'Combine flour, oats, brown sugar, and cold butter for the crumble topping.',
          'Spread fruit mixture in the baking dish and top with crumble mixture.',
          'Bake for 30-35 minutes until golden and bubbly.',
          'Let cool for 10 minutes before serving with ice cream or whipped cream.'
        ]
      },
      {
        name: 'Fruit Salad',
        instructions: [
          'Wash and prepare all fruits by cutting into bite-sized pieces.',
          'Combine fruits in a large bowl and gently toss to mix.',
          'Make a simple dressing with lemon juice, honey, and a pinch of salt.',
          'Drizzle dressing over fruits and toss gently to coat.',
          'Chill in refrigerator for 30 minutes to allow flavors to meld.',
          'Serve cold, garnished with fresh mint leaves or coconut flakes.'
        ]
      }
    ];
  } else {
    cookingMethods = [
      {
        name: 'Stir-fry',
        instructions: [
          'Heat 2 tablespoons of oil in a large wok or heavy-bottomed skillet over high heat until shimmering.',
          'Add aromatics (garlic, ginger, onions) and stir-fry for 30 seconds until fragrant and slightly golden.',
          'Add the hardest vegetables first (carrots, broccoli stems) and stir-fry for 2-3 minutes until they start to soften.',
          'Add protein and cook for 3-4 minutes, stirring constantly, until almost cooked through.',
          'Add softer vegetables and continue stir-frying for 2 minutes until crisp-tender.',
          'Create a well in the center, add sauce ingredients, and let it bubble for 30 seconds.',
          'Toss everything together and add fresh herbs, then serve immediately over steamed rice or noodles.'
        ]
      },
    {
      name: 'One-pot',
      instructions: [
        'Heat 2 tablespoons of oil in a large Dutch oven or heavy pot over medium-high heat.',
        'Add diced aromatics (onions, celery, carrots) and cook for 5-7 minutes until softened and golden.',
        'Add minced garlic and cook for 1 minute until fragrant, being careful not to burn.',
        'Add protein and brown on all sides for 4-5 minutes to develop flavor.',
        'Deglaze the pot with wine or broth, scraping up any browned bits from the bottom.',
        'Add main ingredients, liquid, and seasonings, then bring to a gentle boil.',
        'Reduce heat to low, cover, and simmer for 25-30 minutes until all ingredients are tender.',
        'Taste and adjust seasonings, then garnish with fresh herbs before serving.'
      ]
    },
    {
      name: 'Baked',
      instructions: [
        'Preheat oven to 400°F (200°C) and position rack in the center.',
        'Prepare ingredients by cutting into uniform pieces for even cooking.',
        'Toss ingredients with oil, seasonings, and herbs in a large bowl until well coated.',
        'Arrange in a single layer in a greased baking dish or on a parchment-lined sheet pan.',
        'Cover with foil and bake for 20 minutes to steam and tenderize.',
        'Remove foil, increase heat to 425°F (220°C), and bake for 15-20 minutes until golden and crispy.',
        'Let rest for 5-10 minutes to allow flavors to meld, then garnish and serve.'
      ]
    },
    {
      name: 'Braised',
      instructions: [
        'Preheat oven to 325°F (160°C) and heat oil in a large oven-safe pot over medium-high heat.',
        'Season and sear protein on all sides until deeply browned, about 4-5 minutes per side.',
        'Remove protein and add aromatics, cooking until softened and golden, about 8-10 minutes.',
        'Add wine or broth to deglaze, scraping up browned bits, and reduce by half.',
        'Return protein to pot, add vegetables and herbs, then add enough liquid to come halfway up.',
        'Bring to a simmer, cover, and transfer to oven for 1.5-2 hours until very tender.',
        'Remove from oven, let rest 15 minutes, then serve with reduced cooking liquid as sauce.'
      ]
    },
    {
      name: 'Grilled',
      instructions: [
        'Preheat grill to medium-high heat (400-450°F) and oil the grates.',
        'Prepare ingredients by cutting into grill-friendly pieces and marinating for 30 minutes.',
        'Pat ingredients dry and season generously with salt, pepper, and herbs.',
        'Place on hot grill and cook for 4-6 minutes per side, only flipping once.',
        'Look for grill marks and proper caramelization before turning.',
        'Move to cooler part of grill if needed to finish cooking without burning.',
        'Let rest for 5 minutes before slicing and serving with fresh garnishes.'
      ]
    }
  ];
  }
  
  // Generate the requested number of recipe variations
  for (let i = 0; i < variations; i++) {
    const id = `fallback-${i + 1}`;
    const type = types[i % types.length];
    const difficulty = difficulties[i % difficulties.length];
    
    // Select cooking method based on ingredient type and recipe index
    let cookingMethod;
    if (primaryType === 'fruits') {
      // For fruits, use appropriate methods: blending, baking, no-cook
      const fruitMethods = cookingMethods.filter(method => 
        ['Smoothie Bowl', 'Fruit Crumble', 'Fruit Salad'].includes(method.name)
      );
      cookingMethod = fruitMethods[i % fruitMethods.length] || cookingMethods[0];
    } else {
      // For savory ingredients, use appropriate cooking methods
      const savoryMethods = cookingMethods.filter(method => 
        !['Smoothie Bowl', 'Fruit Crumble', 'Fruit Salad'].includes(method.name)
      );
      cookingMethod = savoryMethods[i % savoryMethods.length] || cookingMethods[0];
    }
    
    const cookingTimeMinutes = Math.min(Math.max(targetTime - 5 + (i * 10), 10), 120);
    
    // Create a recipe name with more variety and sophistication
    const mainIngredient = ingredients[0] || 'Mixed';
    let dishTypes = [];
    
    if (primaryType === 'fruits') {
      dishTypes = [
        'Smoothie Bowl', 'Fruit Crumble', 'Fresh Salad', 'Parfait', 
        'Compote', 'Tart', 'Sorbet', 'Fruit Bowl', 
        'Cobbler', 'Fruit Pizza', 'Smoothie', 'Fruit Salsa',
        'Fruit Smoothie', 'Berry Parfait', 'Fruit Tart', 'Fruit Compote',
        'Fruit Sorbet', 'Fruit Cobbler', 'Fruit Salad', 'Fruit Bowl',
        'Fruit Smoothie Bowl', 'Fruit Crumble', 'Fruit Parfait', 'Fruit Tart'
      ];
    } else if (primaryType === 'vegetables') {
      dishTypes = [
        'Garden Salad', 'Roasted Vegetables', 'Vegetable Soup', 'Stir-fry',
        'Grilled Vegetables', 'Vegetable Pasta', 'Vegetable Curry', 'Vegetable Stew',
        'Vegetable Wrap', 'Vegetable Pizza', 'Vegetable Quiche', 'Vegetable Risotto',
        'Vegetable Tacos', 'Vegetable Stir-fry', 'Vegetable Soup', 'Vegetable Salad',
        'Vegetable Pasta', 'Vegetable Curry', 'Vegetable Stew', 'Vegetable Wrap'
      ];
    } else if (primaryType === 'proteins') {
      dishTypes = [
        'Grilled Protein', 'Protein Bowl', 'Protein Pasta', 'Protein Stir-fry',
        'Protein Curry', 'Protein Stew', 'Protein Tacos', 'Protein Salad',
        'Protein Wrap', 'Protein Pizza', 'Protein Risotto', 'Protein Soup',
        'Protein Skillet', 'Protein Casserole', 'Protein Platter', 'Protein Feast'
      ];
    } else {
      dishTypes = [
        'Mediterranean Bowl', 'Rustic Skillet', 'Heritage Casserole', 'Garden Salad', 
        'Hearty Soup', 'Artisan Pasta', 'Gourmet Wrap', 'Fusion Stir-fry', 
        'Slow-braised Stew', 'Charred Grill Platter', 'One-pot Wonder', 'Sheet Pan Feast',
        'Gourmet Bowl', 'Artisan Skillet', 'Heritage Stew', 'Fusion Bowl',
        'Mediterranean Pasta', 'Rustic Soup', 'Heritage Wrap', 'Garden Stir-fry'
      ];
    }
    
    // Select dish type based on ingredient analysis and recipe index for variety
    let dishType;
    if (primaryType === 'fruits') {
      // For fruits, prioritize based on ingredient combinations
      if (ingredients.some(ing => ['banana', 'strawberry', 'blueberry'].includes(ing.toLowerCase()))) {
        const berryPriorities = ['Smoothie Bowl', 'Fruit Crumble', 'Fresh Salad', 'Parfait', 'Compote', 'Tart'];
        dishType = i < berryPriorities.length ? berryPriorities[i] : dishTypes[i % dishTypes.length];
      } else if (ingredients.some(ing => ['apple', 'pear'].includes(ing.toLowerCase()))) {
        const applePriorities = ['Fruit Crumble', 'Tart', 'Compote', 'Smoothie Bowl', 'Fresh Salad', 'Parfait'];
        dishType = i < applePriorities.length ? applePriorities[i] : dishTypes[i % dishTypes.length];
      } else {
        const fruitPriorities = ['Smoothie Bowl', 'Fruit Crumble', 'Fresh Salad', 'Parfait', 'Compote', 'Tart'];
        dishType = i < fruitPriorities.length ? fruitPriorities[i] : dishTypes[i % dishTypes.length];
      }
    } else if (primaryType === 'vegetables') {
      // For vegetables, prioritize based on ingredient types
      if (ingredients.some(ing => ['tomato', 'onion', 'garlic'].includes(ing.toLowerCase()))) {
        const tomatoPriorities = ['Garden Salad', 'Roasted Vegetables', 'Vegetable Soup', 'Stir-fry', 'Grilled Vegetables', 'Vegetable Pasta'];
        dishType = i < tomatoPriorities.length ? tomatoPriorities[i] : dishTypes[i % dishTypes.length];
      } else if (ingredients.some(ing => ['carrot', 'celery', 'potato'].includes(ing.toLowerCase()))) {
        const rootPriorities = ['Vegetable Soup', 'Roasted Vegetables', 'Vegetable Stew', 'Garden Salad', 'Stir-fry', 'Grilled Vegetables'];
        dishType = i < rootPriorities.length ? rootPriorities[i] : dishTypes[i % dishTypes.length];
      } else {
        const vegPriorities = ['Garden Salad', 'Roasted Vegetables', 'Vegetable Soup', 'Stir-fry', 'Grilled Vegetables', 'Vegetable Pasta'];
        dishType = i < vegPriorities.length ? vegPriorities[i] : dishTypes[i % dishTypes.length];
      }
    } else if (primaryType === 'proteins') {
      // For proteins, prioritize based on protein type
      if (ingredients.some(ing => ['chicken', 'turkey'].includes(ing.toLowerCase()))) {
        const poultryPriorities = ['Grilled Protein', 'Protein Bowl', 'Protein Pasta', 'Protein Stir-fry', 'Protein Curry', 'Protein Salad'];
        dishType = i < poultryPriorities.length ? poultryPriorities[i] : dishTypes[i % dishTypes.length];
      } else if (ingredients.some(ing => ['beef', 'pork', 'lamb'].includes(ing.toLowerCase()))) {
        const meatPriorities = ['Grilled Protein', 'Protein Stew', 'Protein Skillet', 'Protein Bowl', 'Protein Pasta', 'Protein Curry'];
        dishType = i < meatPriorities.length ? meatPriorities[i] : dishTypes[i % dishTypes.length];
      } else {
        const proteinPriorities = ['Grilled Protein', 'Protein Bowl', 'Protein Pasta', 'Protein Stir-fry', 'Protein Curry', 'Protein Salad'];
        dishType = i < proteinPriorities.length ? proteinPriorities[i] : dishTypes[i % dishTypes.length];
      }
    } else {
      // For general/mixed ingredients, use intelligent selection
      const generalPriorities = ['Mediterranean Bowl', 'Rustic Skillet', 'Heritage Casserole', 'Garden Salad', 'Hearty Soup', 'Artisan Pasta'];
      dishType = i < generalPriorities.length ? generalPriorities[i] : dishTypes[i % dishTypes.length];
    }
    // Capitalize the main ingredient properly
    const capitalizedIngredient = mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1).toLowerCase();
    const recipeName = `${capitalizedIngredient} ${dishType}`;
    
    // Generate different ingredient quantities and add sophisticated pantry staples
    const recipeIngredients = [];
    let pantryStaples = [];
    
    if (primaryType === 'fruits') {
      pantryStaples = [
        ['2 tablespoons honey', '1 teaspoon vanilla extract', 'Pinch of salt', 'Fresh mint leaves for garnish'],
        ['1/2 cup granola', '2 tablespoons Greek yogurt', '1 tablespoon chia seeds', 'Coconut flakes for topping'],
        ['1/4 cup brown sugar', '2 tablespoons all-purpose flour', '1 teaspoon cinnamon', 'Vanilla ice cream for serving'],
        ['1/4 cup maple syrup', '1 tablespoon lemon juice', '1 teaspoon ginger, grated', 'Fresh berries for garnish'],
        ['1/2 cup oats', '2 tablespoons almond butter', '1 tablespoon flax seeds', 'Dark chocolate chips'],
        ['1/4 cup coconut milk', '1 tablespoon agave nectar', '1 teaspoon cardamom', 'Toasted coconut for topping'],
        ['1/2 cup Greek yogurt', '2 tablespoons honey', '1 teaspoon vanilla', 'Granola and nuts for crunch'],
        ['1/4 cup sugar', '1 tablespoon cornstarch', '1 teaspoon lemon zest', 'Whipped cream for serving']
      ];
    } else {
      pantryStaples = [
        ['2 tablespoons extra virgin olive oil', 'Sea salt and freshly ground black pepper', '1 teaspoon red pepper flakes', 'Fresh herbs for garnish'],
        ['3 tablespoons unsalted butter', '4 cloves garlic, minced', '1 medium onion, diced', 'Kosher salt and white pepper', '1 tablespoon fresh thyme'],
        ['2 tablespoons avocado oil', '2 teaspoons smoked paprika', '1 teaspoon ground cumin', '1 bay leaf', 'Salt and pepper to taste'],
        ['3 tablespoons olive oil', '2 tablespoons fresh lemon juice', '1 tablespoon balsamic vinegar', '1 teaspoon honey', 'Fresh basil and parsley'],
        ['2 tablespoons ghee', '1 tablespoon garam masala', '1 teaspoon turmeric', '1 inch fresh ginger, grated', 'Cilantro for garnish'],
        ['2 tablespoons sesame oil', '2 tablespoons soy sauce', '1 tablespoon rice vinegar', '1 teaspoon sriracha', 'Green onions and sesame seeds'],
        ['3 tablespoons coconut oil', '1 can coconut milk', '2 teaspoons curry powder', '1 tablespoon fish sauce', 'Fresh lime and cilantro'],
        ['2 tablespoons duck fat', '1 cup dry white wine', '2 sprigs rosemary', '1 teaspoon juniper berries', 'Coarse sea salt']
      ];
    }
    
    // Add main ingredients with varied quantities
    ingredients.forEach((ingredient, index) => {
      const quantities = [1, 2, 3];
      const units = ['cup', 'tablespoon', 'teaspoon', 'piece', 'pound', 'ounce'];
      const quantity = quantities[index % quantities.length];
      const unit = units[index % units.length];
      const unitText = quantity > 1 ? `${unit}s` : unit;
      recipeIngredients.push(`${quantity} ${unitText} of ${ingredient}`);
    });
    
    // Add appropriate pantry staples based on ingredient type and recipe index
    const selectedPantry = pantryStaples[i % pantryStaples.length];
    recipeIngredients.push(...selectedPantry);
    
    // Generate sophisticated, detailed instructions based on cooking method
    let instructions;
    
    if (primaryType === 'fruits') {
      // For fruit recipes, use the cooking method instructions directly
      instructions = cookingMethod.instructions;
    } else {
      // For savory recipes, customize the instructions
      instructions = cookingMethod.instructions.map((step, stepIndex) => {
        if (stepIndex === 1) { // Customize the aromatics step
          const aromatics = [
            'diced yellow onion and minced garlic',
            'thinly sliced shallots and grated ginger', 
            'chopped leeks and crushed garlic cloves',
            'diced red bell pepper and minced garlic',
            'sliced fennel and minced shallots',
            'chopped celery and minced garlic'
          ];
          const selectedAromatic = aromatics[i % aromatics.length];
          return `Add ${selectedAromatic} and cook, stirring frequently, until softened and aromatic, about 3-4 minutes.`;
        } else if (stepIndex === 2) { // Customize the main cooking step
          const mainIngredient = ingredients[0] || 'main ingredients';
          const cookingTimes = [Math.floor(cookingTimeMinutes / 6), Math.floor(cookingTimeMinutes / 5), Math.floor(cookingTimeMinutes / 4)];
          const selectedTime = cookingTimes[i % cookingTimes.length];
          const techniques = [
            'sear until golden brown on all sides',
            'cook until lightly caramelized and tender',
            'brown until crispy edges form',
            'cook until opaque and slightly firm',
            'sauté until just beginning to soften'
          ];
          const selectedTechnique = techniques[i % techniques.length];
          return `Add ${mainIngredient} and ${selectedTechnique}, about ${selectedTime} minutes, stirring occasionally.`;
        } else if (stepIndex === 3) { // Customize the liquid/sauce step
          const liquids = [
            'rich chicken or vegetable broth',
            'dry white wine or vermouth', 
            'coconut milk and fish sauce',
            'crushed tomatoes and red wine',
            'bone broth and apple cider vinegar',
            'heavy cream and brandy'
          ];
          const selectedLiquid = liquids[i % liquids.length];
          const techniques = [
            'bring to a gentle boil, then reduce heat',
            'simmer uncovered until reduced by half',
            'bring to a rolling boil, then immediately reduce',
            'heat until just below boiling point',
            'bring to a vigorous boil, then lower heat'
          ];
          const selectedTechnique = techniques[i % techniques.length];
          return `Add ${selectedLiquid} and ${selectedTechnique} for 2-3 minutes.`;
        } else if (stepIndex === 4) { // Add more detailed finishing steps
          const finishingTouches = [
            'Taste and adjust seasoning with salt, pepper, and a splash of acid (lemon juice or vinegar).',
            'Finish with a drizzle of high-quality olive oil and fresh herbs just before serving.',
            'Garnish with toasted nuts, seeds, or crispy shallots for texture and visual appeal.',
            'Add a final squeeze of citrus and a pinch of flaky sea salt to brighten the flavors.',
            'Let the dish rest for 5 minutes to allow flavors to meld before serving.',
            'Check for proper seasoning and add a touch of sweetness if needed (honey or maple syrup).'
          ];
          return finishingTouches[i % finishingTouches.length];
        }
        return step;
      });
    }
    
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
  console.log(`Server listening on http://localhost:${PORT}`);
});