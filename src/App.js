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

// Components for recipe management
import BookmarksSection from './components/bookmarks/BookmarksSection';
import RecipeView from './components/recipe/RecipeView';

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
    currentStep, setCurrentStep,
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
      {(currentUser || isGuest) && (
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
                  onClick={() => {
                    setCurrentPage('home');
                    setCurrentStep(STEPS.UPLOAD_IMAGE);
                    setImage(null);
                    setRecipe(null);
                  }}
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
              ) : (
                <button
                  className="login-nav-btn"
                  onClick={() => setCurrentPage('auth')}
                  title="Sign in to save recipes"
                >
                  🔐 Sign In
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {(currentUser || isGuest) && <StepNavigation />}
      
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
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.DONE && (
          <DoneScreen setCurrentPage={setCurrentPage} />
        )}
        {!showWelcomeScreen && currentPage === 'home' && currentStep === STEPS.BOOKMARKS && (
          <BookmarksSection
            bookmarkedRecipes={bookmarkedRecipes}
            handleViewRecipe={handleViewRecipe}
            handleRemoveBookmark={handleRemoveBookmark}
            recipeRatings={recipeRatings}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* Recipe flow is now handled by the component screens */}

        {/* Bookmarks section */}
        {currentPage === 'bookmarks' &&  (
          <BookmarksSection
            bookmarkedRecipes={bookmarkedRecipes}
            handleViewRecipe={handleViewRecipe}
            handleRemoveBookmark={handleRemoveBookmark}
            recipeRatings={recipeRatings}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* Recipe view section */}
        {currentPage === 'recipe-view' && viewingRecipe && (
          <RecipeView 
            viewingRecipe={viewingRecipe}
            image={image}
            handleBackToBookmarks={handleBackToBookmarks}
            recipeRatings={recipeRatings}
            handleRatingChange={handleRatingChange}
            getIngredientEmoji={getIngredientEmoji}
            setCurrentPage={setCurrentPage}
          />
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
