import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { getIngredientEmoji, commonIngredients } from '../utils/ingredientUtils';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../contexts/AuthContext';

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
  // Get authentication and bookmarking hooks
  const { currentUser } = useAuth();
  const { addToBookmarks, removeFromBookmarks, checkIfBookmarked, bookmarks } = useBookmarks();
  // Main flow state
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD_IMAGE);
  
  // Image upload state
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // For backward compatibility
  const image = images.length > 0 ? images[currentImageIndex] : null;
  const setImage = (newImage) => {
    if (newImage === null) {
      setImages([]);
      setCurrentImageIndex(0);
    } else {
      setImages([newImage]);
      setCurrentImageIndex(0);
    }
  };
  
  // Ingredients state
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [ingredientSources, setIngredientSources] = useState({}); // Maps ingredients to their source image index
  const [editedIngredients, setEditedIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [processingStatus, setProcessingStatus] = useState({
    total: 0,
    processed: 0,
    inProgress: false
  });
  
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
    const files = e.target.files;
    if (files && files.length > 0) {
      // Process all selected files
      const newImages = [];
      let processedCount = 0;
      
      setIsLoading(true);
      setProcessingStatus({
        total: files.length,
        processed: 0,
        inProgress: true
      });
      
      // Arrays to collect ingredients from all images
      const allIngredients = [];
      const sourceMap = {};
      
      // Process each file
      Array.from(files).forEach((file, fileIndex) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result;
          newImages.push(imageData);
          
          // Process ingredients for this image
          console.log(`Calling API to identify ingredients for image ${fileIndex + 1}...`);
          fetch('http://localhost:5000/api/identify-ingredients', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image: imageData
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log(`API response for image ${fileIndex + 1}:`, data);
            // Get the identified ingredients from the API response
            const identifiedIngredients = data.ingredients || [];
            
            // If no ingredients were identified, use some defaults for this image
            const ingredients = identifiedIngredients.length > 0 
              ? identifiedIngredients 
              : fileIndex === 0 ? ['tomato', 'onion', 'garlic'] : ['bell pepper', 'olive oil', 'pasta'];
            
            // Add these ingredients to our collection and track their source
            ingredients.forEach(ingredient => {
              if (!allIngredients.includes(ingredient)) {
                allIngredients.push(ingredient);
                sourceMap[ingredient] = fileIndex;
              }
            });
            
            // Update processing status
            processedCount++;
            setProcessingStatus(prev => ({
              ...prev,
              processed: processedCount
            }));
            
            // When all images are processed
            if (processedCount === files.length) {
              // Update images state with all new images
              setImages(newImages);
              setCurrentImageIndex(0);
              
              // Update ingredients with all detected ingredients
              setDetectedIngredients(allIngredients);
              setEditedIngredients(allIngredients);
              setIngredientSources(sourceMap);
              
              // Complete processing
              setIsLoading(false);
              setProcessingStatus(prev => ({
                ...prev,
                inProgress: false
              }));
              
              // Move to the next step
              setCurrentStep(STEPS.EDIT_INGREDIENTS);
            }
          })
          .catch(error => {
            console.error(`Error identifying ingredients for image ${fileIndex + 1}:`, error);
            
            // Still count this as processed even if it failed
            processedCount++;
            setProcessingStatus(prev => ({
              ...prev,
              processed: processedCount
            }));
            
            // When all images are processed (even with some failures)
            if (processedCount === files.length) {
              // If we have no ingredients at all, use defaults
              if (allIngredients.length === 0) {
                const defaultIngredients = ['tomato', 'onion', 'garlic', 'bell pepper', 'olive oil', 'pasta'];
                setDetectedIngredients(defaultIngredients);
                setEditedIngredients(defaultIngredients);
                
                // Create default source map
                const defaultSourceMap = {};
                defaultIngredients.forEach(ingredient => {
                  defaultSourceMap[ingredient] = 0;
                });
                setIngredientSources(defaultSourceMap);
              } else {
                // Use whatever ingredients we did manage to detect
                setDetectedIngredients(allIngredients);
                setEditedIngredients(allIngredients);
                setIngredientSources(sourceMap);
              }
              
              // Complete processing
              setIsLoading(false);
              setProcessingStatus(prev => ({
                ...prev,
                inProgress: false
              }));
              
              // Move to the next step
              setCurrentStep(STEPS.EDIT_INGREDIENTS);
            }
          });
        };
        reader.readAsDataURL(file);
      });
    }
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
  const handleBookmarkSelectedRecipe = useCallback(async () => {
    if (!selectedRecipe) return;
    
    try {
      if (currentUser) {
        // If user is signed in, use Firebase bookmarking
        const recipeToBookmark = {
          name: selectedRecipe.name,
          ingredients: selectedRecipe.ingredients,
          instructions: selectedRecipe.instructions || [],
          cookingTime: selectedRecipe.cookingTime || '',
          difficulty: selectedRecipe.difficulty || '',
          cuisine: selectedRecipe.cuisine || '',
          imageUrl: image // Include the original image
        };
        
        await addToBookmarks(recipeToBookmark);
        console.log('Selected recipe bookmarked in Firebase');
      } else {
        // For guest mode, continue using localStorage
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
      }
    } catch (error) {
      console.error('Error bookmarking selected recipe:', error);
    }
    
    // Move to done screen
    setCurrentStep(STEPS.DONE);
  }, [selectedRecipe, bookmarkedRecipes, currentUser, addToBookmarks, image]);
  
  // Move to bookmarks screen
  const handleGoToBookmarks = useCallback((setCurrentPage) => {
    // Update the current step
    setCurrentStep(STEPS.BOOKMARKS);
    
    // Update the current page if setCurrentPage is provided
    if (setCurrentPage) {
      setCurrentPage('bookmarks');
    }
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

  const handleBookmarkRecipe = useCallback(async () => {
    if (!recipe) return;
    
    try {
      if (currentUser) {
        // If user is signed in, use Firebase bookmarking
        const recipeToBookmark = {
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          cookingTime: recipe.cookingTime,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine || '',
          imageUrl: image // Include the original image
        };
        
        await addToBookmarks(recipeToBookmark);
        console.log('Recipe bookmarked in Firebase');
      } else {
        // For guest mode, continue using localStorage
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
            localStorage.setItem('bookmarkedRecipes', JSON.stringify(reducedBookmarks));
          }
        }
      }
    } catch (error) {
      console.error('Error bookmarking recipe:', error);
    }
  }, [recipe, bookmarkedRecipes, image, currentUser, addToBookmarks]);

  const isRecipeBookmarked = useCallback(() => {
    if (!recipe) return false;
    
    if (currentUser) {
      // If user is signed in, use Firebase bookmarking check
      const firebaseBookmark = bookmarks.find(bookmark => 
        bookmark.title === recipe.name && 
        bookmark.ingredients.length === recipe.ingredients.length
      );
      return !!firebaseBookmark;
    } else {
      // For guest mode, continue using localStorage check
      return bookmarkedRecipes.some(bookmarked => 
        bookmarked.name === recipe.name && 
        bookmarked.ingredients.length === recipe.ingredients.length
      );
    }
  }, [recipe, bookmarkedRecipes, currentUser, bookmarks]);

  const handleRemoveBookmark = useCallback(async (recipeId) => {
    try {
      if (currentUser) {
        // If user is signed in, use Firebase bookmarking
        await removeFromBookmarks(recipeId);
        console.log('Recipe removed from Firebase bookmarks');
      } else {
        // For guest mode, continue using localStorage
        const updatedBookmarks = bookmarkedRecipes.filter(bookmark => bookmark.id !== recipeId);
        setBookmarkedRecipes(updatedBookmarks);
        localStorage.setItem('bookmarkedRecipes', JSON.stringify(updatedBookmarks));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }, [bookmarkedRecipes, currentUser, removeFromBookmarks]);

  const handleViewRecipe = useCallback((bookmarkedRecipe, setCurrentPage) => {
    setViewingRecipe(bookmarkedRecipe);
    setImage(bookmarkedRecipe.image || bookmarkedRecipe.imageUrl); // Set the original image
    
    // Update the current page to recipe-view
    if (setCurrentPage) {
      setCurrentPage('recipe-view');
    }
  }, []);

  const handleBackToBookmarks = useCallback(() => {
    setViewingRecipe(null);
    setCurrentStep(STEPS.BOOKMARKS);
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
  }, [setImage, setRecipe, setCookingTime, setCuisineKeywords, setNewIngredient, setIsEditingIngredients]);

  // Value object to be provided to consumers
  const contextValue = {
    // Flow state
    currentStep, setCurrentStep,
    STEPS,
    
    // Image state
    images, setImages,
    image, setImage,
    currentImageIndex, setCurrentImageIndex,
    
    // Ingredients state
    detectedIngredients, setDetectedIngredients,
    ingredientSources, setIngredientSources,
    editedIngredients, setEditedIngredients,
    newIngredient, setNewIngredient,
    showSuggestions, setShowSuggestions,
    filteredSuggestions, setFilteredSuggestions,
    
    // Processing status
    processingStatus,
    
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
