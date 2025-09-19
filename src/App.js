import React from 'react';
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
  const {
    // Flow state
    currentStep,
    STEPS,
    
    // Legacy state
    bookmarkedRecipes,
    viewingRecipe,
    recipeRatings,
    
    // Legacy methods
    handleViewRecipe,
    handleRemoveBookmark,
    handleBackToBookmarks,
    handleRatingChange
  } = useRecipe();

  return (
    <div className="app">
      <Header 
        currentStep={currentStep}
        bookmarkedRecipes={bookmarkedRecipes} 
      />

      <StepNavigation />
      
      <main className="main-content">
        {/* New multi-step flow screens */}
        {currentStep === STEPS.UPLOAD_IMAGE && <UploadImageScreen />}
        {currentStep === STEPS.EDIT_INGREDIENTS && <EditIngredientsScreen />}
        {currentStep === STEPS.SET_PREFERENCES && <PreferencesScreen />}
        {currentStep === STEPS.VIEW_RECIPES && <RecipeOptionsScreen />}
        {currentStep === STEPS.DONE && <DoneScreen />}
        
        {/* Legacy screens for compatibility */}
        {currentStep === STEPS.BOOKMARKS && (
          <BookmarksSection
            bookmarkedRecipes={bookmarkedRecipes}
            handleViewRecipe={handleViewRecipe}
            handleRemoveBookmark={handleRemoveBookmark}
            recipeRatings={recipeRatings}
          />
        )}
        
        {currentStep === STEPS.RECIPE_VIEW && viewingRecipe && (
          <RecipeViewSection
            viewingRecipe={viewingRecipe}
            handleBackToBookmarks={handleBackToBookmarks}
            recipeRatings={recipeRatings}
            handleRatingChange={handleRatingChange}
          />
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
