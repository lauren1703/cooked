import React from 'react';
import IngredientItem from '../utils/IngredientItem';
import StarRating from '../utils/StarRating';

const RecipeViewSection = ({ 
  viewingRecipe, 
  image, 
  handleBackToBookmarks, 
  recipeRatings, 
  handleRatingChange,
  getIngredientEmoji 
}) => {
  if (!viewingRecipe) return null;
  
  return (
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
                  <IngredientItem
                    key={index}
                    ingredient={ingredient}
                    index={index}
                    getIngredientEmoji={getIngredientEmoji}
                    isEditing={false}
                  />
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
        <StarRating 
          rating={recipeRatings[viewingRecipe.id]} 
          recipeId={viewingRecipe.id}
          onRatingChange={handleRatingChange}
        />
        <p className="rating-text">
          {recipeRatings[viewingRecipe.id] 
            ? `You rated this recipe ${recipeRatings[viewingRecipe.id]} star${recipeRatings[viewingRecipe.id] > 1 ? 's' : ''}`
            : 'Click a star to rate this recipe'
          }
        </p>
      </div>
    </section>
  );
};

export default RecipeViewSection;
