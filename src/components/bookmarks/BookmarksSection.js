import React from 'react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../contexts/AuthContext';

const BookmarksSection = ({ 
  bookmarkedRecipes, 
  handleViewRecipe, 
  handleRemoveBookmark, 
  recipeRatings,
  setCurrentPage 
}) => {
  // Get Firebase bookmarks
  const { currentUser } = useAuth();
  const { bookmarks, loading } = useBookmarks();
  
  // Use Firebase bookmarks if user is signed in, otherwise use localStorage bookmarks
  const displayBookmarks = currentUser ? bookmarks : bookmarkedRecipes;
  return (
    <section className="bookmarks-section">
      <h2>Your Bookmarked Recipes</h2>
      {loading ? (
        <div className="loading-bookmarks">
          <p>Loading your bookmarks...</p>
        </div>
      ) : displayBookmarks.length === 0 ? (
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
            {displayBookmarks.map((bookmarkedRecipe) => (
              <div key={bookmarkedRecipe.id} className="bookmark-card">
                <div className="bookmark-content">
                  <div className="bookmark-header">
                    <h3>{currentUser ? bookmarkedRecipe.title : bookmarkedRecipe.name}</h3>
                    <span className="bookmark-icon">🔖</span>
                  </div>
                  <div className="bookmark-meta">
                    <span>⏱️ {bookmarkedRecipe.cookingTime}</span>
                    <span>⚡ {bookmarkedRecipe.difficulty}</span>
                    {(bookmarkedRecipe.rating || recipeRatings[bookmarkedRecipe.id]) && (
                      <span className="bookmark-rating">
                        ⭐ {bookmarkedRecipe.rating || recipeRatings[bookmarkedRecipe.id]}/5
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
                      onClick={() => handleViewRecipe(bookmarkedRecipe, setCurrentPage)}
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
                    {currentUser && bookmarkedRecipe.createdAt ? (
                      // Firebase timestamp format
                      `Bookmarked on ${new Date(bookmarkedRecipe.createdAt.seconds * 1000).toLocaleDateString()}`
                    ) : bookmarkedRecipe.bookmarkedAt ? (
                      // localStorage date string format
                      `Bookmarked on ${new Date(bookmarkedRecipe.bookmarkedAt).toLocaleDateString()}`
                    ) : (
                      'Recently bookmarked'
                    )}
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
