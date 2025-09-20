import React, { useState, useEffect } from 'react';
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

const RecipeView = ({ 
  viewingRecipe, 
  image, 
  handleBackToBookmarks, 
  recipeRatings, 
  handleRatingChange,
  getIngredientEmoji,
  setCurrentPage,
  userIngredients = [] // Add user ingredients for feasibility check
}) => {
  // State for multiple images
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Initialize images from the recipe
  useEffect(() => {
    if (image) {
      setImages(Array.isArray(image) ? image : [image]);
    } else if (viewingRecipe && viewingRecipe.images) {
      setImages(viewingRecipe.images);
    } else if (viewingRecipe && viewingRecipe.imageUrl) {
      setImages([viewingRecipe.imageUrl]);
    } else if (viewingRecipe && viewingRecipe.image) {
      setImages([viewingRecipe.image]);
    } else {
      setImages([]);
    }
    setCurrentImageIndex(0);
  }, [image, viewingRecipe]);
  if (!viewingRecipe) return null;
  
  return (
    <section className="recipe-view-section">
      <div className="recipe-view-header">
        <button 
          className="back-btn"
          onClick={() => {
            handleBackToBookmarks();
            setCurrentPage('bookmarks');
          }}
        >
          ← Back to Bookmarks
        </button>
        <h2>{viewingRecipe.name || viewingRecipe.title}</h2>
      </div>
      
      <div className="recipe-view-content">
        <div className="recipe-view-image">
          {images.length > 0 ? (
            <div className="recipe-images">
              <div className="recipe-image-container">
                <img 
                  src={images[currentImageIndex]} 
                  alt={viewingRecipe.name || viewingRecipe.title} 
                  className="recipe-image"
                />
              </div>
              
              {images.length > 1 && (
                <div className="image-navigation">
                  <button 
                    className="nav-button prev"
                    onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                    title="Previous image"
                  >
                    ◀
                  </button>
                  
                  <span className="image-counter">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  
                  <button 
                    className="nav-button next"
                    onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                    title="Next image"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
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
              {(() => {
                const feasibility = checkIngredientFeasibility(viewingRecipe.ingredients, userIngredients);
                return (
                  <>
                    <div className="ingredient-feasibility-summary">
                      <div className="feasibility-header">
                        <span className="feasibility-icon">
                          {feasibility.percentage >= 80 ? '✅' : feasibility.percentage >= 60 ? '⚠️' : '❌'}
                        </span>
                        <span className="feasibility-text">
                          {feasibility.percentage >= 80 ? 'Easy to make!' : 
                           feasibility.percentage >= 60 ? 'Need a few items' : 'Need many items'}
                        </span>
                        <span className="feasibility-percentage">
                          {feasibility.percentage}%
                        </span>
                      </div>
                      <div className="feasibility-progress-bar">
                        <div 
                          className="feasibility-progress-fill" 
                          style={{ 
                            width: `${feasibility.percentage}%`,
                            backgroundColor: feasibility.percentage >= 80 ? '#4CAF50' : 
                                           feasibility.percentage >= 60 ? '#FF9800' : '#F44336'
                          }}
                        ></div>
                      </div>
                      <div className="feasibility-details">
                        <span className="ingredient-count">
                          <strong>{feasibility.hasCount}</strong> of <strong>{feasibility.totalCount}</strong> ingredients you have
                        </span>
                      </div>
                    </div>
                    
                    <ul className="ingredients-list">
                      {viewingRecipe.ingredients.map((ingredient, index) => {
                        const ingredientLower = ingredient.toLowerCase().trim();
                        const isMatched = feasibility.matched.some(match => 
                          match.recipe.toLowerCase().trim() === ingredientLower
                        );
                        const isPantryStaple = feasibility.pantryStaples.some(pantry => 
                          pantry.toLowerCase().trim() === ingredientLower
                        );
                        
                        return (
                          <li 
                            key={index} 
                            className={`ingredient-item ${isMatched ? 'has-ingredient' : isPantryStaple ? 'pantry-staple' : 'missing-ingredient'}`}
                          >
                            <span className="ingredient-emoji">{getIngredientEmoji(ingredient)}</span>
                            <span className="ingredient-text">{ingredient}</span>
                            <span className="ingredient-status">
                              {isMatched ? '✅' : isPantryStaple ? '🏠' : '❌'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                );
              })()}
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
  );
};

export default RecipeView;
