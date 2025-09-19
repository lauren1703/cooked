import React from 'react';
import { useRecipe } from '../../context/RecipeContext';
import './RecipeFlow.css';

const PreferencesScreen = () => {
  const { 
    cookingTime, 
    cuisineKeywords,
    editedIngredients,
    isLoading,
    handleCookingTimeChange,
    handleCuisineKeywordsChange,
    handlePreferencesComplete,
    currentStep,
    STEPS,
    setCurrentStep
  } = useRecipe();

  // Common cuisine options for quick selection
  const cuisineOptions = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 
    'Indian', 'French', 'American', 'Middle Eastern'
  ];

  const handleCuisineSelect = (cuisine) => {
    handleCuisineKeywordsChange({ target: { value: cuisine } });
  };

  return (
    <section className="preferences-screen">
      <div className="preferences-container">
        <h2 className="preferences-title">Customize Your Recipe</h2>
        <p className="preferences-subtitle">Tell us your preferences for the perfect dish</p>
        
        <div className="ingredients-summary">
          <h3>Your Ingredients</h3>
          <div className="ingredients-tags">
            {editedIngredients.map((ingredient, index) => (
              <span key={index} className="ingredient-tag">
                {ingredient}
              </span>
            ))}
          </div>
        </div>
        
        <div className="preferences-form">
          <div className="preference-group">
            <label htmlFor="cooking-time">
              <span className="preference-icon">⏱️</span> 
              Cooking Time (minutes)
            </label>
            <input
              id="cooking-time"
              type="text"
              value={cookingTime}
              onChange={handleCookingTimeChange}
              placeholder="e.g., 30 (defaults to 20)"
              className="preference-input"
            />
            <div className="time-buttons">
              {[15, 30, 45, 60].map(time => (
                <button 
                  key={time}
                  className={`time-option ${parseInt(cookingTime) === time ? 'selected' : ''}`}
                  onClick={() => handleCookingTimeChange({ target: { value: time.toString() } })}
                >
                  {time} min
                </button>
              ))}
            </div>
          </div>
          
          <div className="preference-group">
            <label htmlFor="cuisine-keywords">
              <span className="preference-icon">🍽️</span> 
              Cuisine Style
            </label>
            <input
              id="cuisine-keywords"
              type="text"
              value={cuisineKeywords}
              onChange={handleCuisineKeywordsChange}
              placeholder="e.g., Italian, Asian, Mexican"
              className="preference-input"
            />
            <div className="cuisine-buttons">
              {cuisineOptions.map(cuisine => (
                <button 
                  key={cuisine}
                  className={`cuisine-option ${cuisineKeywords === cuisine ? 'selected' : ''}`}
                  onClick={() => handleCuisineSelect(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="navigation-buttons">
          <button 
            className="back-button"
            onClick={() => setCurrentStep(STEPS.EDIT_INGREDIENTS)}
          >
            Back to Ingredients
          </button>
          <button 
            className="generate-button"
            onClick={handlePreferencesComplete}
            disabled={isLoading}
          >
            {isLoading ? 'Generating Recipes...' : 'Generate Recipes'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PreferencesScreen;
