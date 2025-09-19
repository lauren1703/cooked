import React, { useState, useCallback, useEffect } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { useBookmarks } from './hooks/useBookmarks';
import Auth from './components/auth/Auth';
import UserProfile from './components/auth/UserProfile';
import './App.css';
import { RecipeProvider, STEPS } from './context/RecipeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StepNavigation from './components/layout/StepNavigation';

// New multi-step flow screens
import UploadImageScreen from './components/recipe/UploadImageScreen';
import EditIngredientsScreen from './components/recipe/EditIngredientsScreen';
import PreferencesScreen from './components/recipe/PreferencesScreen';
import RecipeOptionsScreen from './components/recipe/RecipeOptionsScreen';
import DoneScreen from './components/recipe/DoneScreen';

// Legacy components for compatibility
import BookmarksSection from './components/bookmarks/BookmarksSection';
import RecipeViewSection from './components/recipe/RecipeViewSection';

import { useRecipe } from './context/RecipeContext';

// Main App Component that uses the context
const AppContent = () => {
  // Auth and bookmarks hooks
  const { currentUser, logout } = useAuth();
  const { bookmarks, addToBookmarks, removeFromBookmarks, toggleBookmark, rateBookmark, getCount } = useBookmarks();
  
  // State for welcome screen and guest mode
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  
  // Recipe context
  const {
    // Flow state
    currentStep,
    STEPS,
    
    // Image state
    image, setImage,
    
    // Recipe state
    recipe, setRecipe,
    isLoading, setIsLoading,
    isEditingIngredients, setIsEditingIngredients,
    newIngredient, setNewIngredient,
    cookingTime, setCookingTime,
    cuisineKeywords, setCuisineKeywords,
    showSuggestions, setShowSuggestions,
    filteredSuggestions, setFilteredSuggestions,
    
    // Legacy state
    bookmarkedRecipes,
    viewingRecipe, setViewingRecipe,
    recipeRatings, setRecipeRatings,
    
    // Methods
    handleViewRecipe,
    handleRemoveBookmark,
    handleBackToBookmarks,
    handleRatingChange,
    handleImageUpload,
    handleIngredientInputChange,
    handleSuggestionClick,
    handleIngredientInputFocus,
    handleIngredientInputBlur,
    handleEditIngredients,
    handleRemoveIngredient,
    handleAddIngredient,
    handleNewIngredientKeyPress,
    handleSaveIngredients,
    handleBookmarkRecipe,
    isRecipeBookmarked,
    handleCookingTimeChange,
    handleCuisineKeywordsChange,
    handleNewRecipe,
    generateRecipe,
    getIngredientEmoji
  } = useRecipe();

  // Handle welcome screen actions
  const handleSignIn = () => {
    setShowWelcomeScreen(false);
    setCurrentPage('auth');
  };

  const handleContinueAsGuest = () => {
    setShowWelcomeScreen(false);
    setIsGuest(true);
    setCurrentPage('home');
  };

  // Handle authentication state changes
  useEffect(() => {
    if (currentUser) {
      // User is authenticated
      setShowWelcomeScreen(false);
      setIsGuest(false);
    } else {
      // User is not authenticated - reset to guest mode
      setIsGuest(false);
      // Show welcome screen when user logs out
      setShowWelcomeScreen(true);
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

      <StepNavigation />
      
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

        {/* New multi-step flow screens */}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.UPLOAD_IMAGE && <UploadImageScreen />}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.EDIT_INGREDIENTS && <EditIngredientsScreen />}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.SET_PREFERENCES && <PreferencesScreen />}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.VIEW_RECIPES && <RecipeOptionsScreen />}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.DONE && <DoneScreen />}
        
        {/* Legacy home screen with image upload */}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.UPLOAD_IMAGE && (
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

        {/* Recipe display section */}
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

        {/* Bookmarks section */}
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

        {/* Recipe view section */}
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

        {/* Auth section */}
        {currentPage === 'auth' && (
          <section className="auth-section">
            <Auth onAuthSuccess={() => setCurrentPage('home')} />
          </section>
        )}

        {/* User profile section */}
        {currentPage === 'profile' && currentUser && (
          <section className="profile-section">
            <UserProfile />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Wrapper component that provides the context
function App() {
  return (
    <RecipeProvider>
      <AppContent />
    </RecipeProvider>
  );
}

export default App;
