import React, { useState } from 'react';
import { useRecipe } from '../../context/RecipeContext';
import './RecipeFlow.css';

const RecipeOptionsScreen = () => {
  const { 
    generatedRecipes, 
    selectedRecipe,
    isLoading,
    handleSelectRecipe,
    handleBookmarkSelectedRecipe,
    setCurrentStep,
    STEPS,
    images,
    currentImageIndex,
    setCurrentImageIndex
  } = useRecipe();
  
  // State to track if the recipe has been bookmarked
  const [isBookmarked, setIsBookmarked] = useState(false);

  const renderDifficultyBadge = (difficulty) => {
    const colors = {
      'Easy': 'green',
      'Medium': 'orange',
      'Hard': 'red'
    };
    
    return (
      <span className={`difficulty-badge ${difficulty.toLowerCase()}`} style={{ backgroundColor: colors[difficulty] }}>
        {difficulty}
      </span>
    );
  };

  return (
    <section className="recipe-options-screen">
      <div className="recipe-options-container">
        <h2 className="options-title">Choose Your Recipe</h2>
        <p className="options-subtitle">We've created three delicious options for you</p>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cooking up some recipes...</p>
          </div>
        ) : (
          <>
            <div className="recipe-cards">
              {generatedRecipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  className={`recipe-card ${selectedRecipe?.id === recipe.id ? 'selected' : ''}`}
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <div className="recipe-card-header">
                    <h3>{recipe.name}</h3>
                    {renderDifficultyBadge(recipe.difficulty)}
                  </div>
                  
                  <div className="recipe-card-meta">
                    <span className="cooking-time">⏱️ {recipe.cookingTime}</span>
                    <span className="ingredients-count">🥕 {recipe.ingredients.length} ingredients</span>
                  </div>
                  
                  <div className="recipe-card-content">
                    <div className="ingredients-preview">
                      <h4>Ingredients</h4>
                      <ul>
                        {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li className="more-ingredients">+{recipe.ingredients.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="instructions-preview">
                      <h4>Instructions</h4>
                      <ol>
                        {recipe.instructions.slice(0, 2).map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                        {recipe.instructions.length > 2 && (
                          <li className="more-instructions">+{recipe.instructions.length - 2} more steps</li>
                        )}
                      </ol>
                    </div>
                  </div>
                  
                  <div className="recipe-card-footer">
                    <button 
                      className={`select-recipe-btn ${selectedRecipe?.id === recipe.id ? 'selected' : ''}`}
                    >
                      {selectedRecipe?.id === recipe.id ? '✓ Selected' : 'Select Recipe'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="recipe-detail">
              {selectedRecipe ? (
                <>
                  <h3>{selectedRecipe.name}</h3>
                  <div className="recipe-meta">
                    <span>⏱️ {selectedRecipe.cookingTime}</span>
                    <span>⚡ {selectedRecipe.difficulty}</span>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="recipe-images">
                      <div className="recipe-image-container">
                        <img 
                          src={images[currentImageIndex]} 
                          alt={`Ingredient ${currentImageIndex + 1}`} 
                          className="recipe-image"
                        />
                      </div>
                      
                      {images.length > 1 && (
                        <div className="image-navigation">
                          <button 
                            className="nav-button prev"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
                            }}
                            title="Previous image"
                          >
                            ◀
                          </button>
                          
                          <span className="image-counter">
                            {currentImageIndex + 1} / {images.length}
                          </span>
                          
                          <button 
                            className="nav-button next"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
                            }}
                            title="Next image"
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="recipe-sections">
                    <div className="ingredients-section">
                      <h4>Ingredients</h4>
                      <ul>
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="instructions-section">
                      <h4>Instructions</h4>
                      <ol>
                        {selectedRecipe.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  
                  <button 
                    className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => {
                      handleBookmarkSelectedRecipe();
                      setIsBookmarked(true);
                    }}
                    disabled={isBookmarked}
                  >
                    {isBookmarked ? '✓ Bookmarked!' : '🔖 Bookmark This Recipe'}
                  </button>
                </>
              ) : (
                <div className="no-selection">
                  <p>Select a recipe to see full details</p>
                </div>
              )}
            </div>
            
            <div className="navigation-buttons">
              <button 
                className="back-button"
                onClick={() => setCurrentStep(STEPS.SET_PREFERENCES)}
              >
                Back to Preferences
              </button>
              <button 
                className="finish-button"
                onClick={() => setCurrentStep(STEPS.DONE)}
                disabled={!selectedRecipe}
              >
                🎉 Finish
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RecipeOptionsScreen;
