import { useState, useCallback, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [cuisineKeywords, setCuisineKeywords] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [recipeRatings, setRecipeRatings] = useState({});

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
      'mint': '🌿', 'sage': '🌿', 'ginger': '🫚', 'cinnamon': '🫚', 'pepper': '🫚', 'salt': '🧂',
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
    setCurrentPage('recipe-view');
  }, []);

  const handleBackToBookmarks = useCallback(() => {
    setViewingRecipe(null);
    setCurrentPage('bookmarks');
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

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
        <h1>Cooked</h1>
        <p>AI-Powered Recipe Generator</p>
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
              🔖 Bookmarks ({bookmarkedRecipes.length})
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentPage === 'home' && (
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
            {bookmarkedRecipes.length === 0 ? (
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
                  {bookmarkedRecipes.map((bookmarkedRecipe) => (
                    <div key={bookmarkedRecipe.id} className="bookmark-card">
                      <div className="bookmark-content">
                        <div className="bookmark-header">
                          <h3>{bookmarkedRecipe.name}</h3>
                          <span className="bookmark-icon">🔖</span>
                        </div>
                        <div className="bookmark-meta">
                          <span>⏱️ {bookmarkedRecipe.cookingTime}</span>
                          <span>⚡ {bookmarkedRecipe.difficulty}</span>
                          {recipeRatings[bookmarkedRecipe.id] && (
                            <span className="bookmark-rating">
                              ⭐ {recipeRatings[bookmarkedRecipe.id]}/5
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
                        <p className="bookmark-date">
                          Bookmarked on {new Date(bookmarkedRecipe.bookmarkedAt).toLocaleDateString()}
                        </p>
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
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star ${star <= (recipeRatings[viewingRecipe.id] || 0) ? 'filled' : ''}`}
                    onClick={() => handleRatingChange(viewingRecipe.id, star)}
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {recipeRatings[viewingRecipe.id] 
                  ? `You rated this recipe ${recipeRatings[viewingRecipe.id]} star${recipeRatings[viewingRecipe.id] > 1 ? 's' : ''}`
                  : 'Click a star to rate this recipe'
                }
              </p>
            </div>
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
