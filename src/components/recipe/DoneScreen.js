import React from 'react';
import { useRecipe } from '../../context/RecipeContext';
import './RecipeFlow.css';

const DoneScreen = () => {
  const { 
    selectedRecipe, 
    handleGoToBookmarks,
    handleStartOver,
    STEPS,
    setCurrentStep
  } = useRecipe();

  return (
    <section className="done-screen">
      <div className="done-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>
        
        <h2 className="done-title">Recipe Saved!</h2>
        <p className="done-subtitle">Your recipe has been bookmarked successfully</p>
        
        {selectedRecipe && (
          <div className="saved-recipe-summary">
            <h3>{selectedRecipe.name}</h3>
            <div className="recipe-meta">
              <span>⏱️ {selectedRecipe.cookingTime}</span>
              <span>⚡ {selectedRecipe.difficulty}</span>
            </div>
            
            <div className="ingredients-count">
              <span>🥕 {selectedRecipe.ingredients.length} ingredients</span>
            </div>
          </div>
        )}
        
        <div className="action-buttons">
          <button 
            className="view-bookmarks-button"
            onClick={handleGoToBookmarks}
          >
            🔖 View All Bookmarks
          </button>
          
          <button 
            className="start-over-button"
            onClick={handleStartOver}
          >
            🍳 Create Another Recipe
          </button>
        </div>
        
        <div className="share-section">
          <h4>Share your recipe</h4>
          <div className="share-buttons">
            <button className="share-button facebook">
              <span className="share-icon">📘</span> Facebook
            </button>
            <button className="share-button twitter">
              <span className="share-icon">🐦</span> Twitter
            </button>
            <button className="share-button email">
              <span className="share-icon">✉️</span> Email
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoneScreen;
