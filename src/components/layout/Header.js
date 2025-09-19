import React from 'react';
import { useRecipe } from '../../context/RecipeContext';

const Header = ({ currentStep, bookmarkedRecipes }) => {
  const { STEPS, setCurrentStep, handleStartOver } = useRecipe();
  
  // Check if we're in the main flow (not in bookmarks or recipe view)
  const isInMainFlow = currentStep !== STEPS.BOOKMARKS && currentStep !== STEPS.RECIPE_VIEW;
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Cooked</h1>
          <p>AI-Powered Recipe Generator</p>
        </div>
        <div className="header-actions">
          {!isInMainFlow && (
            <button 
              className="cook-more-nav-btn"
              onClick={handleStartOver}
              title="Generate new recipe"
            >
              🍳 Let's Cook More!
            </button>
          )}
          <button 
            className="bookmarks-nav-btn"
            onClick={() => {
              if (currentStep === STEPS.RECIPE_VIEW) {
                setCurrentStep(STEPS.BOOKMARKS);
              } else {
                setCurrentStep(isInMainFlow ? STEPS.BOOKMARKS : STEPS.UPLOAD_IMAGE);
              }
            }}
            title="View bookmarked recipes"
          >
            🔖 Bookmarks ({bookmarkedRecipes.length})
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
