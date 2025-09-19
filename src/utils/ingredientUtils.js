// Function to get emoji for ingredients
export const getIngredientEmoji = (ingredient) => {
  const ingredientLower = ingredient.toLowerCase();
  
  // Common ingredient emoji mappings
  const emojiMap = {
    // Proteins
    'chicken': '🐔', 'beef': '🥩', 'pork': '🐷', 'fish': '🐟', 'salmon': '🐟', 'tuna': '🐟',
    'shrimp': '🦐', 'crab': '🦀', 'lobster': '🦞', 'eggs': '🥚', 'egg': '🥚', 'bacon': '🥓',
    'ham': '🍖', 'sausage': '🌭', 'turkey': '🦃', 'lamb': '🐑',
    
    // Vegetables
    'onion': '🧅', 'garlic': '🧄', 'tomato': '🍅', 'tomatoes': '🍅', 'carrot': '🥕', 'carrots': '🥕',
    'potato': '🥔', 'potatoes': '🥔', 'bell pepper': '🫑', 'pepper': '🫑', 'peppers': '🫑',
    'cucumber': '🥒', 'lettuce': '🥬', 'spinach': '🥬', 'broccoli': '🥦', 'cauliflower': '🥦',
    'corn': '🌽', 'mushroom': '🍄', 'mushrooms': '🍄', 'avocado': '🥑', 'olive': '🫒', 'olives': '🫒',
    'zucchini': '🥒', 'eggplant': '🍆', 'cabbage': '🥬', 'celery': '🥬', 'radish': '🥬',
    
    // Fruits
    'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'lemon': '🍋', 'lime': '🍋', 'grape': '🍇',
    'strawberry': '🍓', 'blueberry': '🫐', 'cherry': '🍒', 'peach': '🍑', 'pear': '🍐',
    'pineapple': '🍍', 'watermelon': '🍉', 'melon': '🍈', 'kiwi': '🥝', 'mango': '🥭',
    
    // Grains & Starches
    'rice': '🍚', 'pasta': '🍝', 'noodles': '🍜', 'bread': '🍞', 'flour': '🌾', 'oats': '🌾',
    'quinoa': '🌾', 'barley': '🌾', 'wheat': '🌾', 'cornmeal': '🌽',
    
    // Dairy
    'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'cream': '🥛', 'yogurt': '🥛', 'sour cream': '🥛',
    
    // Herbs & Spices
    'basil': '🌿', 'parsley': '🌿', 'cilantro': '🌿', 'oregano': '🌿', 'thyme': '🌿', 'rosemary': '🌿',
    'mint': '🌿', 'sage': '🌿', 'ginger': '🫚', 'cinnamon': '🫚', 'black pepper': '🫚', 'salt': '🧂',
    'sugar': '🍯', 'honey': '🍯', 'vanilla': '🍯',
    
    // Nuts & Seeds
    'almond': '🥜', 'almonds': '🥜', 'walnut': '🥜', 'walnuts': '🥜', 'peanut': '🥜', 'peanuts': '🥜',
    'cashew': '🥜', 'cashews': '🥜', 'pistachio': '🥜', 'pistachios': '🥜', 'sesame': '🥜',
    
    // Oils & Fats
    'oil': '🫒', 'olive oil': '🫒', 'coconut oil': '🥥', 'vegetable oil': '🫒',
    
    // Legumes
    'bean': '🫘', 'beans': '🫘', 'lentil': '🫘', 'lentils': '🫘', 'chickpea': '🫘', 'chickpeas': '🫘',
    'soy': '🫘', 'tofu': '🫘',
    
    // Other common ingredients
    'chocolate': '🍫', 'cocoa': '🍫', 'coffee': '☕', 'tea': '🍵', 'wine': '🍷', 'beer': '🍺',
    'vinegar': '🍶', 'soy sauce': '🍶', 'ketchup': '🍅', 'mustard': '🟡', 'mayo': '🟡', 'mayonnaise': '🟡'
  };
  
  // Check for exact matches first
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (ingredientLower.includes(key)) {
      return emoji;
    }
  }
  
  // Default yummy face for unmatched ingredients
  return '😋';
};

// Common ingredients for suggestions
export const commonIngredients = [
  'chicken breast', 'ground beef', 'salmon fillet', 'shrimp', 'eggs', 'bacon',
  'onion', 'garlic', 'tomato', 'carrot', 'potato', 'bell pepper', 'cucumber',
  'lettuce', 'spinach', 'broccoli', 'mushroom', 'avocado', 'olive oil',
  'pasta', 'rice', 'bread', 'flour', 'milk', 'cheese', 'butter', 'cream',
  'basil', 'parsley', 'oregano', 'thyme', 'salt', 'pepper', 'sugar', 'honey',
  'almonds', 'walnuts', 'olive oil', 'vegetable oil', 'black beans', 'chickpeas',
  'lemon', 'lime', 'apple', 'banana', 'strawberry', 'chocolate', 'cinnamon',
  'ginger', 'soy sauce', 'vinegar', 'mustard', 'mayonnaise', 'ketchup'
];
