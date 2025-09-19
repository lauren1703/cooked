import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { getIngredientEmoji, commonIngredients } from '../utils/ingredientUtils';

// Create the context
const RecipeContext = createContext();

// Flow steps
export const STEPS = {
  UPLOAD_IMAGE: 'upload-image',
  EDIT_INGREDIENTS: 'edit-ingredients',
  SET_PREFERENCES: 'set-preferences',
  VIEW_RECIPES: 'view-recipes',
  DONE: 'done',
  BOOKMARKS: 'bookmarks',
  RECIPE_VIEW: 'recipe-view'
};

// Create a provider component
export const RecipeProvider = ({ children }) => {
  // Main flow state
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD_IMAGE);
  
  // Image upload state
  const [image, setImage] = useState(null);
  
  // Ingredients state
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [editedIngredients, setEditedIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  
  // Preferences state
  const [cookingTime, setCookingTime] = useState('');
  const [cuisineKeywords, setCuisineKeywords] = useState('');
  
  // Recipe state
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Bookmarks state
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [recipeRatings, setRecipeRatings] = useState({});
  
  // Legacy state for compatibility
  const [recipe, setRecipe] = useState(null);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);

  // Load bookmarked recipes and ratings from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedRecipes');
    if (saved) {
      setBookmarkedRecipes(JSON.parse(saved));
    }
    
    const savedRatings = localStorage.getItem('recipeRatings');
    if (savedRatings) {
      setRecipeRatings(JSON.parse(savedRatings));
    }
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setImage(imageData);
        
        setIsLoading(true);
        
        console.log('Calling API to identify ingredients...');
        fetch('http://localhost:5000/api/identify-ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: imageData // Send the base64 image data
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('API response:', data);
          // Get the identified ingredients from the API response
          const identifiedIngredients = data.ingredients || [];
          
          // If no ingredients were identified, use some default ingredients
          const ingredients = identifiedIngredients.length > 0 
            ? identifiedIngredients 
            : ['tomato', 'onion', 'garlic', 'bell pepper', 'olive oil', 'pasta'];
          
          setDetectedIngredients(ingredients);
          setEditedIngredients(ingredients);
          setIsLoading(false);
          
          // Move to the next step
          setCurrentStep(STEPS.EDIT_INGREDIENTS);
        })
        .catch(error => {
          console.error('Error identifying ingredients:', error);
          
          // Fallback to default ingredients if the API call fails
          const defaultIngredients = ['tomato', 'onion', 'garlic', 'bell pepper', 'olive oil', 'pasta'];
          setDetectedIngredients(defaultIngredients);
          setEditedIngredients(defaultIngredients);
          setIsLoading(false);
          setCurrentStep(STEPS.EDIT_INGREDIENTS);
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // API integration code - separated for future implementation
  const identifyIngredientsFromAPI = useCallback((imageData) => {
    // This function would call the backend API to identify ingredients
    // For now, it's just a placeholder that would be implemented by someone else
    console.log('API integration to be implemented by another developer');
    
    // Return mock data for now
    return Promise.resolve({
      ingredients: ['tomato', 'onion', 'garlic', 'bell pepper', 'olive oil', 'pasta']
    });
  }, []);
  
  // Add ingredient to the edited list
  const handleAddIngredientToList = useCallback(() => {
    if (newIngredient.trim()) {
      setEditedIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  }, [newIngredient]);
  
  // Remove ingredient from the edited list
  const handleRemoveIngredientFromList = useCallback((indexToRemove) => {
    setEditedIngredients(prev => 
      prev.filter((_, index) => index !== indexToRemove)
    );
  }, []);
  
  // Move from ingredient editing to preferences screen
  const handleIngredientsComplete = useCallback(() => {
    setCurrentStep(STEPS.SET_PREFERENCES);
  }, []);
  
  // Move from preferences to recipe generation
  const handlePreferencesComplete = useCallback(() => {
    setIsLoading(true);
    
    // Generate three recipe options based on ingredients and preferences
    setTimeout(() => {
      const timeInput = cookingTime.trim() || '20';
      const cuisineInput = cuisineKeywords.trim() || 'Italian';
      
      // Create three different recipe variations
      const recipes = [
        {
          id: '1',
          name: `${cuisineInput} Style ${editedIngredients[0]} Delight`,
          ingredients: editedIngredients.map(ingredient => {
            const quantity = Math.floor(Math.random() * 3) + 1;
            const units = ['cup', 'tablespoon', 'teaspoon', 'piece'];
            const unit = units[Math.floor(Math.random() * units.length)];
            return `${quantity} ${unit}${quantity > 1 ? 's' : ''} of ${ingredient}`;
          }),
          instructions: [
            `Prepare all ${editedIngredients.length} ingredients.`,
            `Start by cooking ${editedIngredients[0]} according to package instructions.`,
            `In a pan, heat some oil over medium heat.`,
            `Add ${editedIngredients.slice(1, 3).join(' and ')} and cook until tender.`,
            `Combine all ingredients in a bowl.`,
            `Season with salt and pepper to taste.`,
            `Serve hot and enjoy your custom creation!`
          ],
          cookingTime: `${timeInput} minutes`,
          difficulty: 'Easy',
          image: image
        },
        {
          id: '2',
          name: `Quick ${cuisineInput} ${editedIngredients[0]} Bowl`,
          ingredients: editedIngredients.map(ingredient => {
            const quantity = Math.floor(Math.random() * 3) + 1;
            const units = ['cup', 'tablespoon', 'teaspoon', 'piece'];
            const unit = units[Math.floor(Math.random() * units.length)];
            return `${quantity} ${unit}${quantity > 1 ? 's' : ''} of ${ingredient}`;
          }),
          instructions: [
            `Chop all ingredients into bite-sized pieces.`,
            `Heat a large skillet over medium heat with some oil.`,
            `Add ${editedIngredients.slice(0, 2).join(' and ')} first and cook for 5 minutes.`,
            `Add remaining ingredients and stir well.`,
            `Cover and simmer for ${Math.floor(parseInt(timeInput) / 2)} minutes.`,
            `Serve in bowls with your favorite garnish.`
          ],
          cookingTime: `${Math.floor(parseInt(timeInput) * 0.8)} minutes`,
          difficulty: 'Medium',
          image: image
        },
        {
          id: '3',
          name: `${cuisineInput} Fusion ${editedIngredients[0]} Special`,
          ingredients: editedIngredients.map(ingredient => {
            const quantity = Math.floor(Math.random() * 3) + 1;
            const units = ['cup', 'tablespoon', 'teaspoon', 'piece'];
            const unit = units[Math.floor(Math.random() * units.length)];
            return `${quantity} ${unit}${quantity > 1 ? 's' : ''} of ${ingredient}`;
          }),
          instructions: [
            `Preheat oven to 375°F (190°C).`,
            `Mix all ingredients in a large bowl.`,
            `Transfer to a baking dish and cover with foil.`,
            `Bake for ${Math.floor(parseInt(timeInput) * 0.6)} minutes.`,
            `Remove foil and bake for another 10 minutes until golden.`,
            `Let rest for 5 minutes before serving.`
          ],
          cookingTime: `${Math.floor(parseInt(timeInput) * 1.2)} minutes`,
          difficulty: 'Hard',
          image: image
        }
      ];
      
      setGeneratedRecipes(recipes);
      setIsLoading(false);
      setCurrentStep(STEPS.VIEW_RECIPES);
    }, 2000);
  }, [editedIngredients, cookingTime, cuisineKeywords, image]);
  
  // Select a recipe from the generated options
  const handleSelectRecipe = useCallback((recipe) => {
    setSelectedRecipe(recipe);
  }, []);
  
  // Bookmark the selected recipe
  const handleBookmarkSelectedRecipe = useCallback(() => {
    if (!selectedRecipe) return;
    
    const recipeToBookmark = {
      ...selectedRecipe,
      id: selectedRecipe.id || Date.now().toString(),
      bookmarkedAt: new Date().toISOString()
    };
    
    const updatedBookmarks = [...bookmarkedRecipes, recipeToBookmark];
    setBookmarkedRecipes(updatedBookmarks);
    
    try {
      localStorage.setItem('bookmarkedRecipes', JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Failed to save bookmark:', error);
    }
    
    // Move to done screen
    setCurrentStep(STEPS.DONE);
  }, [selectedRecipe, bookmarkedRecipes]);
  
  // Move to bookmarks screen
  const handleGoToBookmarks = useCallback(() => {
    setCurrentStep(STEPS.BOOKMARKS);
  }, []);
  
  // Start over with a new recipe
  const handleStartOver = useCallback(() => {
    setImage(null);
    setDetectedIngredients([]);
    setEditedIngredients([]);
    setNewIngredient('');
    setCookingTime('');
    setCuisineKeywords('');
    setGeneratedRecipes([]);
    setSelectedRecipe(null);
    setCurrentStep(STEPS.UPLOAD_IMAGE);
  }, []);
  
  // Legacy generateRecipe function for compatibility
  const generateRecipe = useCallback(() => {
    handlePreferencesComplete();
  }, [handlePreferencesComplete]);

  const handleEditIngredients = useCallback(() => {
    setIsEditingIngredients(true);
  }, []);

  const handleSaveIngredients = useCallback(() => {
    setIsLoading(true);
    // Simulate recipe regeneration based on updated ingredients
    setTimeout(() => {
      setRecipe(prev => ({
        ...prev,
        name: `Custom Recipe with ${prev.ingredients.length} Ingredients`,
        instructions: [
          'Prepare all your ingredients as listed above.',
          'Follow your preferred cooking method for these ingredients.',
          'Season to taste and adjust cooking times as needed.',
          'Serve hot and enjoy your custom creation!'
        ],
        cookingTime: `${Math.max(15, prev.ingredients.length * 3)} minutes`,
        difficulty: prev.ingredients.length > 8 ? 'Medium' : 'Easy'
      }));
      setIsLoading(false);
      setIsEditingIngredients(false);
    }, 1000);
  }, []);

  const handleRemoveIngredient = useCallback((indexToRemove) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, index) => index !== indexToRemove)
    }));
  }, []);

  const handleAddIngredient = useCallback(() => {
    if (newIngredient.trim()) {
      setRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  }, [newIngredient]);

  const handleNewIngredientKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  }, [handleAddIngredient]);

  const handleIngredientInputChange = useCallback((e) => {
    const value = e.target.value;
    setNewIngredient(value);
    
    if (value.length > 0) {
      const filtered = commonIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setNewIngredient(suggestion);
    setShowSuggestions(false);
  }, []);

  const handleIngredientInputFocus = useCallback(() => {
    if (newIngredient.length > 0) {
      setShowSuggestions(true);
    }
  }, [newIngredient]);

  const handleIngredientInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleBookmarkRecipe = useCallback(() => {
    if (!recipe) return;
    
    const recipeToBookmark = {
      ...recipe,
      id: Date.now().toString(),
      bookmarkedAt: new Date().toISOString(),
      image: image // Include the original image
    };
    
    const updatedBookmarks = [...bookmarkedRecipes, recipeToBookmark];
    setBookmarkedRecipes(updatedBookmarks);
    
    try {
      localStorage.setItem('bookmarkedRecipes', JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      // If localStorage is full, try to clear old bookmarks
      if (error.name === 'QuotaExceededError') {
        const reducedBookmarks = updatedBookmarks.slice(-3); // Keep only last 3 to save space
        setBookmarkedRecipes(reducedBookmarks);
        try {
          localStorage.setItem('bookmarkedRecipes', JSON.stringify(reducedBookmarks));
        } catch (retryError) {
          console.error('Still unable to save bookmarks:', retryError);
          // If still failing, save without images
          const bookmarksWithoutImages = reducedBookmarks.map(bookmark => ({
            ...bookmark,
            image: null
          }));
          localStorage.setItem('bookmarkedRecipes', JSON.stringify(bookmarksWithoutImages));
        }
      }
    }
  }, [recipe, bookmarkedRecipes, image]);

  const isRecipeBookmarked = useCallback(() => {
    if (!recipe) return false;
    return bookmarkedRecipes.some(bookmarked => 
      bookmarked.name === recipe.name && 
      bookmarked.ingredients.length === recipe.ingredients.length
    );
  }, [recipe, bookmarkedRecipes]);

  const handleRemoveBookmark = useCallback((recipeId) => {
    const updatedBookmarks = bookmarkedRecipes.filter(bookmark => bookmark.id !== recipeId);
    setBookmarkedRecipes(updatedBookmarks);
    localStorage.setItem('bookmarkedRecipes', JSON.stringify(updatedBookmarks));
  }, [bookmarkedRecipes]);

  const handleViewRecipe = useCallback((bookmarkedRecipe) => {
    setViewingRecipe(bookmarkedRecipe);
    setImage(bookmarkedRecipe.image); // Set the original image
    setCurrentStep(STEPS.RECIPE_VIEW);
    // STEPS is a constant and doesn't need to be in the dependency array
  }, []);

  const handleBackToBookmarks = useCallback(() => {
    setViewingRecipe(null);
    setCurrentStep(STEPS.BOOKMARKS);
    // STEPS is a constant and doesn't need to be in the dependency array
  }, []);

  const handleRatingChange = useCallback((recipeId, rating) => {
    const newRatings = { ...recipeRatings, [recipeId]: rating };
    setRecipeRatings(newRatings);
    localStorage.setItem('recipeRatings', JSON.stringify(newRatings));
  }, [recipeRatings]);

  const handleCookingTimeChange = useCallback((e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCookingTime(value);
    }
  }, []);

  const handleCuisineKeywordsChange = useCallback((e) => {
    const value = e.target.value;
    // Only allow letters, spaces, commas, and hyphens
    if (value === '' || /^[a-zA-Z\s,-\s]*$/.test(value)) {
      setCuisineKeywords(value);
    }
  }, []);

  const handleNewRecipe = useCallback(() => {
    setImage(null);
    setRecipe(null);
    setCookingTime('');
    setCuisineKeywords('');
    setNewIngredient('');
    setIsEditingIngredients(false);
  }, []);

  // Value object to be provided to consumers
  const contextValue = {
    // Flow state
    currentStep, setCurrentStep,
    STEPS,
    
    // Image state
    image, setImage,
    
    // Ingredients state
    detectedIngredients, setDetectedIngredients,
    editedIngredients, setEditedIngredients,
    newIngredient, setNewIngredient,
    showSuggestions, setShowSuggestions,
    filteredSuggestions, setFilteredSuggestions,
    
    // Preferences state
    cookingTime, setCookingTime,
    cuisineKeywords, setCuisineKeywords,
    
    // Recipe state
    generatedRecipes, setGeneratedRecipes,
    selectedRecipe, setSelectedRecipe,
    isLoading, setIsLoading,
    
    // Bookmarks state
    bookmarkedRecipes, setBookmarkedRecipes,
    viewingRecipe, setViewingRecipe,
    recipeRatings, setRecipeRatings,
    
    // Legacy state for compatibility
    recipe, setRecipe,
    isEditingIngredients, setIsEditingIngredients,
    
    // Methods for multi-step flow
    handleImageUpload,
    handleAddIngredientToList,
    handleRemoveIngredientFromList,
    handleIngredientsComplete,
    handlePreferencesComplete,
    handleSelectRecipe,
    handleBookmarkSelectedRecipe,
    handleGoToBookmarks,
    handleStartOver,
    identifyIngredientsFromAPI,
    
    // Utility methods
    getIngredientEmoji,
    handleIngredientInputChange,
    handleSuggestionClick,
    handleIngredientInputFocus,
    handleIngredientInputBlur,
    handleCookingTimeChange,
    handleCuisineKeywordsChange,
    
    // Legacy methods for compatibility
    generateRecipe,
    handleEditIngredients,
    handleSaveIngredients,
    handleRemoveIngredient,
    handleAddIngredient,
    handleNewIngredientKeyPress,
    handleBookmarkRecipe,
    isRecipeBookmarked,
    handleRemoveBookmark,
    handleViewRecipe,
    handleBackToBookmarks,
    handleRatingChange,
    handleNewRecipe
  };

  return (
    <RecipeContext.Provider value={contextValue}>
      {children}
    </RecipeContext.Provider>
  );
};

// Custom hook to use the recipe context
export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};
