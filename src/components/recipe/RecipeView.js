import React, { useState, useEffect } from 'react';
import './RecipeFlow.css';

const RecipeView = ({ 
  viewingRecipe, 
  image, 
  handleBackToBookmarks, 
  recipeRatings, 
  handleRatingChange,
  getIngredientEmoji,
  setCurrentPage
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
  );
};

export default RecipeView;
