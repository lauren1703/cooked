import React from 'react';

const BookmarksSection = ({ 
  bookmarkedRecipes, 
  handleViewRecipe, 
  handleRemoveBookmark, 
  recipeRatings,
  setCurrentPage 
}) => {
  return (
    <section className="bookmarks-section">
      <h2>Your Bookmarked Recipes</h2>
      {bookmarkedRecipes.length === 0 ? (
        <div className="no-bookmarks">
          <p>No bookmarked recipes yet. Generate and bookmark some recipes to see them here!</p>
          <button 
            className="cook-more-btn"
            onClick={() => setCurrentPage('home')}
          >
            🍳 Let's Start Cooking!
          </button>
        </div>
      ) : (
        <>
          <div className="bookmarks-grid">
            {bookmarkedRecipes.map((bookmarkedRecipe) => (
              <div key={bookmarkedRecipe.id} className="bookmark-card">
                <div className="bookmark-content">
                  <div className="bookmark-header">
                    <h3>{bookmarkedRecipe.name}</h3>
                    <span className="bookmark-icon">🔖</span>
                  </div>
                  <div className="bookmark-meta">
                    <span>⏱️ {bookmarkedRecipe.cookingTime}</span>
                    <span>⚡ {bookmarkedRecipe.difficulty}</span>
                    {recipeRatings[bookmarkedRecipe.id] && (
                      <span className="bookmark-rating">
                        ⭐ {recipeRatings[bookmarkedRecipe.id]}/5
                      </span>
                    )}
                  </div>
                  <div className="bookmark-ingredients-preview">
                    <span className="ingredients-label">Ingredients:</span>
                    <span className="ingredients-count">{bookmarkedRecipe.ingredients.length} items</span>
                  </div>
                  <div className="bookmark-actions">
                    <button 
                      className="view-recipe-btn"
                      onClick={() => handleViewRecipe(bookmarkedRecipe)}
                    >
                      👁️ View Recipe
                    </button>
                    <button 
                      className="remove-bookmark-btn"
                      onClick={() => handleRemoveBookmark(bookmarkedRecipe.id)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                  <p className="bookmark-date">
                    Bookmarked on {new Date(bookmarkedRecipe.bookmarkedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default BookmarksSection;
