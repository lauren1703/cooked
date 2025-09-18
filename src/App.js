import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useBookmarks } from './hooks/useBookmarks';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  // eslint-disable-next-line no-unused-vars
  const { currentUser, logout } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { bookmarks, addToBookmarks, removeFromBookmarks, toggleBookmark, rateBookmark, getCount } = useBookmarks();
  const [image, setImage] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [cuisineKeywords, setCuisineKeywords] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [recipeRatings, setRecipeRatings] = useState({});
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(() => {
    // Check if user has seen welcome screen before
    return !localStorage.getItem('hasSeenWelcomeScreen');
  });
  const [isGuest, setIsGuest] = useState(false);

  // Handle welcome screen actions
  const handleSignIn = () => {
    setShowWelcomeScreen(false);
    localStorage.setItem('hasSeenWelcomeScreen', 'true');
    setCurrentPage('auth');
  };

  const handleContinueAsGuest = () => {
    setShowWelcomeScreen(false);
    localStorage.setItem('hasSeenWelcomeScreen', 'true');
    setIsGuest(true);
    setCurrentPage('home');
  };

  // Logout functionality is now handled by Firebase auth state changes

  // Handle authentication state changes
  useEffect(() => {
    if (currentUser) {
      // User is authenticated
      setShowWelcomeScreen(false);
      setIsGuest(false);
      localStorage.setItem('hasSeenWelcomeScreen', 'true');
    } else {
      // User is not authenticated - reset to guest mode
      setIsGuest(false);
      // Don't show welcome screen if user has seen it before
      if (localStorage.getItem('hasSeenWelcomeScreen')) {
        setShowWelcomeScreen(false);
      }
    }
  }, [currentUser]);

  // Reset app state when user logs out (currentUser becomes null)
  useEffect(() => {
    if (!currentUser && !isGuest) {
      // User has logged out - reset app state
      setImage(null);
      setRecipe(null);
      setIsEditingIngredients(false);
      setNewIngredient('');
      setCookingTime('');
      setCuisineKeywords('');
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      setViewingRecipe(null);
      setRecipeRatings({});
    }
  }, [currentUser, isGuest]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const generateRecipe = useCallback(() => {
    if (!image) return;
    
    setIsLoading(true);
    // TODO: Implement actual API call to your AI service
    setTimeout(() => {
      const timeInput = cookingTime.trim() || '20';
      const cuisineInput = cuisineKeywords.trim() || 'Italian';
      
      const newRecipe = {
        name: `${cuisineInput} Style Pasta Primavera`,
        ingredients: [
          '200g pasta',
          '1 cup mixed vegetables (bell peppers, zucchini, carrots)',
          '2 cloves garlic, minced',
          '2 tbsp olive oil',
          'Salt and pepper to taste',
          'Grated parmesan for serving'
        ],
        instructions: [
          'Cook pasta according to package instructions.',
          'In a large pan, heat olive oil over medium heat.',
          'Add minced garlic and sauté until fragrant.',
          'Add mixed vegetables and cook until tender.',
          'Drain pasta and add to the pan with vegetables.',
          'Toss everything together and season with salt and pepper.',
          'Serve hot with grated parmesan.'
        ],
        cookingTime: `${timeInput} minutes`,
        difficulty: 'Easy'
      };
      setRecipe(newRecipe);
      setIsLoading(false);
    }, 1500);
  }, [image, cookingTime, cuisineKeywords]);

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

  // Function to get emoji for ingredients
  const getIngredientEmoji = useCallback((ingredient) => {
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
      'mint': '🌿', 'sage': '🌿', 'ginger': '🫚', 'cinnamon': '🫚', 'salt': '🧂',
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
  }, []);

  // Common ingredients for suggestions
  const commonIngredients = [
    'chicken breast', 'ground beef', 'salmon fillet', 'shrimp', 'eggs', 'bacon',
    'onion', 'garlic', 'tomato', 'carrot', 'potato', 'bell pepper', 'cucumber',
    'lettuce', 'spinach', 'broccoli', 'mushroom', 'avocado', 'olive oil',
    'pasta', 'rice', 'bread', 'flour', 'milk', 'cheese', 'butter', 'cream',
    'basil', 'parsley', 'oregano', 'thyme', 'salt', 'pepper', 'sugar', 'honey',
    'almonds', 'walnuts', 'olive oil', 'vegetable oil', 'black beans', 'chickpeas',
    'lemon', 'lime', 'apple', 'banana', 'strawberry', 'chocolate', 'cinnamon',
    'ginger', 'soy sauce', 'vinegar', 'mustard', 'mayonnaise', 'ketchup'
  ];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Load recipe ratings from localStorage and sync with Firestore bookmarks
  useEffect(() => {
    const savedRatings = localStorage.getItem('recipeRatings');
    if (savedRatings) {
      setRecipeRatings(JSON.parse(savedRatings));
    }
  }, []);

  // Sync local ratings with Firestore bookmarks when bookmarks change
  useEffect(() => {
    if (bookmarks.length > 0) {
      const firestoreRatings = {};
      bookmarks.forEach(bookmark => {
        if (bookmark.rating) {
          firestoreRatings[bookmark.id] = bookmark.rating;
        }
      });
      
      // Merge Firestore ratings with local ratings (Firestore takes precedence)
      setRecipeRatings(prevRatings => {
        const mergedRatings = { ...prevRatings, ...firestoreRatings };
        localStorage.setItem('recipeRatings', JSON.stringify(mergedRatings));
        return mergedRatings;
      });
    }
  }, [bookmarks]);

  const handleBookmarkRecipe = useCallback(async () => {
    if (!recipe) return;
    
    if (!currentUser) {
      alert('Please sign in to bookmark recipes');
      return;
    }

    try {
      const recipeToBookmark = {
        ...recipe,
        imageUrl: image
      };
      
      const bookmarkId = await addToBookmarks(recipeToBookmark);
      
      // If this recipe has a rating, save it to Firestore now that it's bookmarked
      if (recipeRatings[recipe.name]) {
        // Wait a moment for the bookmark to be fully created
        setTimeout(async () => {
          try {
            await rateBookmark(bookmarkId, recipeRatings[recipe.name]);
          } catch (error) {
            console.error('Failed to save rating for bookmarked recipe:', error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to bookmark recipe:', error);
      alert('Failed to bookmark recipe. Please try again.');
    }
  }, [recipe, image, currentUser, addToBookmarks, recipeRatings, rateBookmark]);

  const isRecipeBookmarked = useCallback(() => {
    if (!recipe || !currentUser) return false;
    return bookmarks.some(bookmarked => 
      bookmarked.title === recipe.name && 
      bookmarked.ingredients.length === recipe.ingredients.length
    );
  }, [recipe, bookmarks, currentUser]);

  const handleRemoveBookmark = useCallback(async (bookmarkId) => {
    if (!currentUser) return;
    
    try {
      await removeFromBookmarks(bookmarkId);
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      alert('Failed to remove bookmark. Please try again.');
    }
  }, [currentUser, removeFromBookmarks]);

  const handleViewRecipe = useCallback((bookmarkedRecipe) => {
    setViewingRecipe(bookmarkedRecipe);
    setImage(bookmarkedRecipe.imageUrl); // Set the original image
    setCurrentPage('recipe-view');
    
    // Ensure the rating from Firestore is in local state for immediate UI updates
    if (bookmarkedRecipe.rating && !recipeRatings[bookmarkedRecipe.id]) {
      const updatedRatings = { ...recipeRatings, [bookmarkedRecipe.id]: bookmarkedRecipe.rating };
      setRecipeRatings(updatedRatings);
      localStorage.setItem('recipeRatings', JSON.stringify(updatedRatings));
    }
  }, [recipeRatings]);

  const handleBackToBookmarks = useCallback(() => {
    setViewingRecipe(null);
    setCurrentPage('bookmarks');
  }, []);

  const handleRatingChange = useCallback(async (recipeId, rating) => {
    try {
      // Update local state immediately for responsive UI
      const newRatings = { ...recipeRatings, [recipeId]: rating };
      setRecipeRatings(newRatings);
      localStorage.setItem('recipeRatings', JSON.stringify(newRatings));
      
      // Update viewingRecipe if we're currently viewing this recipe
      if (viewingRecipe && viewingRecipe.id === recipeId) {
        setViewingRecipe(prev => ({ ...prev, rating }));
      }
      
      // Save to Firestore if user is logged in
      if (currentUser) {
        // Find the bookmark for this recipe
        const bookmark = bookmarks.find(b => b.id === recipeId);
        
        if (bookmark) {
          // This is a bookmarked recipe - save to Firestore
          await rateBookmark(recipeId, rating);
        } else {
          // This might be a recipe that's not yet bookmarked, but we still want to save the rating
          // The rating will be saved when the recipe gets bookmarked
          console.log('Rating saved locally for non-bookmarked recipe. Will be saved to Firestore when bookmarked.');
        }
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      // Revert local state on error
      const revertedRatings = { ...recipeRatings };
      delete revertedRatings[recipeId];
      setRecipeRatings(revertedRatings);
      localStorage.setItem('recipeRatings', JSON.stringify(revertedRatings));
    }
  }, [recipeRatings, currentUser, bookmarks, rateBookmark, viewingRecipe]);

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

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
        <h1>Cooked</h1>
        <p>AI-Powered Recipe Generator {isGuest && <span className="guest-indicator">(Guest Mode)</span>}</p>
          </div>
          <div className="header-actions">
            {currentPage !== 'home' && (
              <button 
                className="cook-more-nav-btn"
                onClick={() => setCurrentPage('home')}
                title="Generate new recipe"
              >
                🍳 Let's Cook More!
              </button>
            )}
            <button 
              className="bookmarks-nav-btn"
              onClick={() => {
                if (currentPage === 'recipe-view') {
                  setCurrentPage('bookmarks');
                  setViewingRecipe(null);
                } else {
                  setCurrentPage(currentPage === 'home' ? 'bookmarks' : 'home');
                }
              }}
              title="View bookmarked recipes"
            >
              🔖 Bookmarks ({getCount()})
            </button>
            {currentUser ? (
              <button
                className={`profile-nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => setCurrentPage(currentPage === 'profile' ? 'home' : 'profile')}
                title="View profile and sign out"
              >
                👤 {currentUser.displayName || 'Profile'}
              </button>
            ) : isGuest ? (
              <button
                className="login-nav-btn"
                onClick={() => setCurrentPage('auth')}
                title="Sign in to save recipes"
              >
                🔐 Sign In
              </button>
            ) : (
              <button
                className="login-nav-btn"
                onClick={() => setCurrentPage('auth')}
                title="Sign in"
              >
                🔐 Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {showWelcomeScreen && !currentUser && (
          <section className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-header">
                <h1>🍳 Welcome to Cooked!</h1>
                <p>Your AI-powered recipe generator</p>
              </div>
              
              <div className="welcome-features">
                <div className="feature">
                  <span className="feature-icon">📸</span>
                  <h3>Photo Recognition</h3>
                  <p>Upload a photo of your ingredients and get instant recipe suggestions</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🤖</span>
                  <h3>AI-Powered</h3>
                  <p>Advanced AI analyzes your ingredients and creates personalized recipes</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">💾</span>
                  <h3>Save & Organize</h3>
                  <p>Bookmark your favorite recipes and access them anytime</p>
                </div>
              </div>

              <div className="welcome-actions">
                <button 
                  className="welcome-signin-btn"
                  onClick={handleSignIn}
                >
                  🔐 Sign In / Sign Up
                </button>
                <button 
                  className="welcome-guest-btn"
                  onClick={handleContinueAsGuest}
                >
                  👤 Continue as Guest
                </button>
              </div>

              <div className="welcome-note">
                <p>💡 <strong>Tip:</strong> Sign in to save your favorite recipes and access them across devices!</p>
              </div>
            </div>
          </section>
        )}

        {currentPage === 'home' && !showWelcomeScreen && (
        <section className="upload-section">
          <div className="upload-area" onClick={() => document.getElementById('image-upload').click()}>
            {image ? (
              <img src={image} alt="Upload preview" className="preview-image" />
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">📷</span>
                <p>Click to upload a photo of your ingredients</p>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          
          {image && (
            <div className="recipe-inputs">
              <div className="input-group">
                <label htmlFor="cooking-time">⏱️ Cooking Time (minutes) <span className="optional-text">(optional)</span></label>
                <input
                  id="cooking-time"
                  type="text"
                  value={cookingTime}
                  onChange={handleCookingTimeChange}
                  placeholder="e.g., 30 (defaults to 20)"
                  className="recipe-input"
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="cuisine-keywords">🍽️ Cuisine Style <span className="optional-text">(optional)</span></label>
                <input
                  id="cuisine-keywords"
                  type="text"
                  value={cuisineKeywords}
                  onChange={handleCuisineKeywordsChange}
                  placeholder="e.g., Italian, Asian, Mexican (defaults to Italian)"
                  className="recipe-input"
                />
              </div>
            </div>
          )}
          
          <button 
            className="generate-btn" 
            onClick={generateRecipe}
            disabled={!image || isLoading}
          >
            {isLoading ? 'Cooking up a recipe...' : 'Generate Recipe'}
          </button>
        </section>
        )}

        {recipe && currentPage === 'home' && (
          <section className="recipe-section">
            <div className="recipe-header">
            <h2>{recipe.name}</h2>
              <button 
                className={`bookmark-btn ${isRecipeBookmarked() ? 'bookmarked' : ''}`}
                onClick={handleBookmarkRecipe}
                title={isRecipeBookmarked() ? 'Remove from bookmarks' : 'Bookmark this recipe'}
              >
                {isRecipeBookmarked() ? '🔖 Bookmarked' : '🔖 Bookmark'}
              </button>
            </div>
            <div className="recipe-meta">
              <span>⏱️ {recipe.cookingTime}</span>
              <span>⚡ {recipe.difficulty}</span>
            </div>
            
            <button 
              className="new-recipe-btn"
              onClick={handleNewRecipe}
              title="Start a new recipe"
            >
              🍳 New Recipe
            </button>
            
            <div className="recipe-details">
              <div className="ingredients">
                <div className="ingredients-header">
                <h3>Ingredients</h3>
                  {!isEditingIngredients && (
                    <button 
                      className="edit-btn"
                      onClick={handleEditIngredients}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
                
                {isEditingIngredients ? (
                  <div className="edit-mode">
                    <div className="ingredients-list-edit">
                      {recipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="ingredient-item">
                          <span className="ingredient-emoji">{getIngredientEmoji(ingredient)}</span>
                          <span className="ingredient-text">{ingredient}</span>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveIngredient(index)}
                            title="Remove ingredient"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="add-ingredient-section">
                      <div className="ingredient-input-container">
                        <input
                          type="text"
                          value={newIngredient}
                          onChange={handleIngredientInputChange}
                          onKeyPress={handleNewIngredientKeyPress}
                          onFocus={handleIngredientInputFocus}
                          onBlur={handleIngredientInputBlur}
                          className="new-ingredient-input"
                          placeholder="Add new ingredient..."
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="suggestions-dropdown">
                            {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <span className="suggestion-emoji">{getIngredientEmoji(suggestion)}</span>
                                <span className="suggestion-text">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        className="add-btn"
                        onClick={handleAddIngredient}
                        disabled={!newIngredient.trim()}
                      >
                        ➕ Add
                      </button>
                    </div>
                    
                    <div className="edit-buttons">
                      <button 
                        className="save-btn"
                        onClick={handleSaveIngredients}
                        disabled={isLoading}
                      >
                        {isLoading ? '🔄 Updating Recipe...' : '💾 Save & Update Recipe'}
                      </button>
                    </div>
                  </div>
                ) : (
                <ul>
                  {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        <span className="ingredient-emoji">{getIngredientEmoji(ingredient)}</span>
                        {ingredient}
                      </li>
                  ))}
                </ul>
                )}
              </div>
              
              <div className="instructions">
                <h3>Instructions</h3>
                <ol>
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}

        {currentPage === 'bookmarks' && (
          <section className="bookmarks-section">
            <h2>Your Bookmarked Recipes</h2>
            {bookmarks.length === 0 ? (
              <div className="no-bookmarks">
                <p>No bookmarked recipes yet. Generate and bookmark some recipes to see them here!</p>
                <button 
                  className="cook-more-btn"
                  onClick={() => setCurrentPage('home')}
                >
                  🍳 Let's Start Cooking!
                </button>
              </div>
            ) : (
              <>
                <div className="bookmarks-grid">
                  {bookmarks.map((bookmarkedRecipe) => (
                    <div key={bookmarkedRecipe.id} className="bookmark-card">
                      <div className="bookmark-content">
                        <div className="bookmark-header">
                          <h3>{bookmarkedRecipe.title}</h3>
                          <span className="bookmark-icon">🔖</span>
                        </div>
                        <div className="bookmark-meta">
                          <span>⏱️ {bookmarkedRecipe.cookingTime}</span>
                          <span>⚡ {bookmarkedRecipe.difficulty}</span>
                          {(bookmarkedRecipe.rating || recipeRatings[bookmarkedRecipe.id]) && (
                            <span className="bookmark-rating">
                              ⭐ {bookmarkedRecipe.rating || recipeRatings[bookmarkedRecipe.id]}/5
                            </span>
                          )}
                        </div>
                        <div className="bookmark-ingredients-preview">
                          <span className="ingredients-label">Ingredients:</span>
                          <span className="ingredients-count">{bookmarkedRecipe.ingredients.length} items</span>
                        </div>
                        <div className="bookmark-actions">
                          <button 
                            className="view-recipe-btn"
                            onClick={() => handleViewRecipe(bookmarkedRecipe)}
                          >
                            👁️ View Recipe
                          </button>
                          <button 
                            className="remove-bookmark-btn"
                            onClick={() => handleRemoveBookmark(bookmarkedRecipe.id)}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {currentPage === 'recipe-view' && viewingRecipe && (
          <section className="recipe-view-section">
            <div className="recipe-view-header">
              <button 
                className="back-btn"
                onClick={handleBackToBookmarks}
              >
                ← Back to Bookmarks
              </button>
              <h2>{viewingRecipe.name}</h2>
            </div>
            
            <div className="recipe-view-content">
              <div className="recipe-view-image">
                {image ? (
                  <img src={image} alt={viewingRecipe.name} />
                ) : (
                  <div className="no-image-placeholder-large">
                    <span className="placeholder-icon">🍳</span>
                    <span className="placeholder-text">Original Image Not Available</span>
                  </div>
                )}
              </div>
              
              <div className="recipe-view-details">
                <div className="recipe-meta">
                  <span>⏱️ {viewingRecipe.cookingTime}</span>
                  <span>⚡ {viewingRecipe.difficulty}</span>
                </div>
                
                <div className="recipe-details">
                  <div className="ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                      {viewingRecipe.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          <span className="ingredient-emoji">{getIngredientEmoji(ingredient)}</span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="instructions">
                    <h3>Instructions</h3>
                    <ol>
                      {viewingRecipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="recipe-rating-section">
              <h3>Rate this Recipe</h3>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = viewingRecipe.rating || recipeRatings[viewingRecipe.id] || 0;
                  return (
                    <button
                      key={star}
                      className={`star ${star <= currentRating ? 'filled' : ''}`}
                      onClick={() => handleRatingChange(viewingRecipe.id, star)}
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ⭐
                    </button>
                  );
                })}
              </div>
              <p className="rating-text">
                {(viewingRecipe.rating || recipeRatings[viewingRecipe.id]) 
                  ? `You rated this recipe ${viewingRecipe.rating || recipeRatings[viewingRecipe.id]} star${(viewingRecipe.rating || recipeRatings[viewingRecipe.id]) > 1 ? 's' : ''}`
                  : 'Click a star to rate this recipe'
                }
              </p>
            </div>
          </section>
        )}

        {currentPage === 'auth' && (
          <section className="auth-section">
            <Auth onAuthSuccess={() => setCurrentPage('home')} />
          </section>
        )}

        {currentPage === 'profile' && currentUser && (
          <section className="profile-section">
            <UserProfile />
          </section>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Cooked - AI Recipe Generator</p>
      </footer>
    </div>
  );
}

export default App;
