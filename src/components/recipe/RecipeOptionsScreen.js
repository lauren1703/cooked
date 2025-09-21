import React, { useState } from 'react';
import { useRecipe } from '../../context/RecipeContext';
import './RecipeFlow.css';

// Enhanced utility function to check ingredient feasibility
// Only counts ingredients that user explicitly inputted, not pantry staples
const checkIngredientFeasibility = (recipeIngredients, userIngredients) => {
  // Enhanced matching with fuzzy logic
  const fuzzyMatch = (ingredient, userIngredient) => {
    const ing = ingredient.toLowerCase().trim();
    const user = userIngredient.toLowerCase().trim();
    
    // Exact match
    if (ing === user) return true;
    
    // Contains match (user ingredient contains recipe ingredient)
    if (ing.includes(user) || user.includes(ing)) return true;
    
    // Word boundary match (handles plurals, etc.)
    const ingWords = ing.split(/\s+/);
    const userWords = user.split(/\s+/);
    
    return ingWords.some(word => 
      userWords.some(userWord => 
        word.includes(userWord) || userWord.includes(word)
      )
    );
  };
  
  const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase().trim());
  
  let hasIngredients = 0;
  let missingIngredients = [];
  let matchedIngredients = [];
  let pantryStaples = [];
  
  recipeIngredients.forEach(ingredient => {
    const ingredientLower = ingredient.toLowerCase().trim();
    
    // Check if user has this ingredient (with fuzzy matching)
    const userMatch = userIngredientsLower.find(user => 
      fuzzyMatch(ingredientLower, user)
    );
    
    if (userMatch) {
      hasIngredients++;
      matchedIngredients.push({
        recipe: ingredient,
        user: userIngredients.find(ui => 
          fuzzyMatch(ingredientLower, ui.toLowerCase().trim())
        )
      });
    } else {
      // Check if it's a common pantry staple (for display purposes only)
      const commonPantryStaples = [
        'oil', 'salt', 'pepper', 'butter', 'water', 'garlic', 'onion', 
        'herbs', 'oregano', 'basil', 'thyme', 'paprika', 'lemon', 'lime',
        'flour', 'sugar', 'vinegar', 'soy sauce', 'olive oil', 'vegetable oil',
        'eggs', 'milk', 'cheese', 'bread', 'rice', 'pasta', 'noodles',
        'tomato', 'tomatoes', 'potato', 'potatoes', 'carrot', 'carrots',
        'celery', 'bell pepper', 'peppers', 'mushroom', 'mushrooms'
      ];
      
      const isPantryStaple = commonPantryStaples.some(basic => 
        ingredientLower.includes(basic.toLowerCase()) || 
        basic.toLowerCase().includes(ingredientLower)
      );
      
      if (isPantryStaple) {
        pantryStaples.push(ingredient);
      } else {
        missingIngredients.push(ingredient);
      }
    }
  });
  
  // Calculate feasibility based ONLY on user's inputted ingredients
  const feasibilityPercentage = Math.round((hasIngredients / recipeIngredients.length) * 100);
  
  return {
    percentage: feasibilityPercentage,
    hasCount: hasIngredients,
    totalCount: recipeIngredients.length,
    missing: missingIngredients,
    matched: matchedIngredients,
    pantryStaples: pantryStaples
  };
};

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
    setCurrentImageIndex,
    editedIngredients
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
                  
                  {/* Enhanced Feasibility Indicator */}
                  {(() => {
                    const feasibility = checkIngredientFeasibility(recipe.ingredients, editedIngredients);
                    const getFeasibilityData = (percentage) => {
                      if (percentage >= 66) {
                        return {
                          color: '#4CAF50',
                          bgColor: '#E8F5E8',
                          text: 'Easy to make!',
                          icon: '✅',
                          borderColor: '#4CAF50'
                        };
                      } else if (percentage >= 33) {
                        return {
                          color: '#FF9800',
                          bgColor: '#FFF3E0',
                          text: 'Need a few items',
                          icon: '⚠️',
                          borderColor: '#FF9800'
                        };
                      } else {
                        return {
                          color: '#F44336',
                          bgColor: '#FFEBEE',
                          text: 'Need many items',
                          icon: '❌',
                          borderColor: '#F44336'
                        };
                      }
                    };
                    
                    const feasibilityData = getFeasibilityData(feasibility.percentage);
                    
                    return (
                      <div className="enhanced-feasibility-indicator" style={{ 
                        backgroundColor: feasibilityData.bgColor,
                        borderColor: feasibilityData.borderColor,
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}>
                        <div className="feasibility-header">
                          <span className="feasibility-icon">{feasibilityData.icon}</span>
                          <span className="feasibility-text" style={{ color: feasibilityData.color }}>
                            {feasibilityData.text}
                          </span>
                          <span className="feasibility-percentage" style={{ color: feasibilityData.color }}>
                            {feasibility.percentage}%
                          </span>
                        </div>
                        
                        <div className="feasibility-progress-bar">
                          <div 
                            className="feasibility-progress-fill" 
                            style={{ 
                              width: `${feasibility.percentage}%`,
                              backgroundColor: feasibilityData.color
                            }}
                          ></div>
                        </div>
                        
                        <div className="feasibility-details">
                          <span className="ingredient-count">
                            <strong>{feasibility.hasCount}</strong> of <strong>{feasibility.totalCount}</strong> ingredients you have
                          </span>
                          {feasibility.pantryStaples.length > 0 && (
                            <span className="pantry-note">
                              ({feasibility.pantryStaples.length} common pantry items)
                            </span>
                          )}
                        </div>
                        
                        {feasibility.matched.length > 0 && (
                          <div className="matched-ingredients">
                            <div className="matched-header">
                              <span className="matched-icon">✅</span>
                              <span>You have these ingredients:</span>
                            </div>
                            <div className="matched-list">
                              {feasibility.matched.slice(0, 3).map((match, index) => (
                                <span key={index} className="matched-item">
                                  {match.user}
                                </span>
                              ))}
                              {feasibility.matched.length > 3 && (
                                <span className="matched-more">
                                  +{feasibility.matched.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {feasibility.pantryStaples.length > 0 && (
                          <div className="pantry-ingredients">
                            <div className="pantry-header">
                              <span className="pantry-icon">🏠</span>
                              <span>Common pantry items (you likely have):</span>
                            </div>
                            <div className="pantry-list">
                              {feasibility.pantryStaples.slice(0, 3).map((ingredient, index) => (
                                <span key={index} className="pantry-item">
                                  {ingredient}
                                </span>
                              ))}
                              {feasibility.pantryStaples.length > 3 && (
                                <span className="pantry-more">
                                  +{feasibility.pantryStaples.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {feasibility.missing.length > 0 && (
                          <div className="missing-ingredients">
                            <div className="missing-header">
                              <span className="missing-icon">🛒</span>
                              <span>Missing ingredients:</span>
                            </div>
                            <div className="missing-list">
                              {feasibility.missing.slice(0, 3).map((ingredient, index) => (
                                <span key={index} className="missing-item">
                                  {ingredient}
                                </span>
                              ))}
                              {feasibility.missing.length > 3 && (
                                <span className="missing-more">
                                  +{feasibility.missing.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
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
