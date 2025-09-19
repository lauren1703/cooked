import React from 'react';
import IngredientItem from '../utils/IngredientItem';

const RecipeSection = ({ 
  recipe, 
  isRecipeBookmarked, 
  handleBookmarkRecipe, 
  handleNewRecipe,
  isEditingIngredients,
  handleEditIngredients,
  handleSaveIngredients,
  handleRemoveIngredient,
  handleAddIngredient,
  newIngredient,
  handleNewIngredientKeyPress,
  handleIngredientInputChange,
  handleIngredientInputFocus,
  handleIngredientInputBlur,
  showSuggestions,
  filteredSuggestions,
  handleSuggestionClick,
  getIngredientEmoji,
  isLoading
}) => {
  if (!recipe) return null;
  
  return (
    <section className="recipe-section">
      <div className="recipe-header">
        <h2>{recipe.name}</h2>
        <button 
          className={`bookmark-btn ${isRecipeBookmarked() ? 'bookmarked' : ''}`}
          onClick={handleBookmarkRecipe}
          title={isRecipeBookmarked() ? 'Remove from bookmarks' : 'Bookmark this recipe'}
        >
          {isRecipeBookmarked() ? '🔖 Bookmarked' : '🔖 Bookmark'}
        </button>
      </div>
      <div className="recipe-meta">
        <span>⏱️ {recipe.cookingTime}</span>
        <span>⚡ {recipe.difficulty}</span>
      </div>
      
      <button 
        className="new-recipe-btn"
        onClick={handleNewRecipe}
        title="Start a new recipe"
      >
        🍳 New Recipe
      </button>
      
      <div className="recipe-details">
        <div className="ingredients">
          <div className="ingredients-header">
            <h3>Ingredients</h3>
            {!isEditingIngredients && (
              <button 
                className="edit-btn"
                onClick={handleEditIngredients}
              >
                ✏️ Edit
              </button>
            )}
          </div>
          
          {isEditingIngredients ? (
            <div className="edit-mode">
              <div className="ingredients-list-edit">
                {recipe.ingredients.map((ingredient, index) => (
                  <IngredientItem
                    key={index}
                    ingredient={ingredient}
                    index={index}
                    getIngredientEmoji={getIngredientEmoji}
                    isEditing={true}
                    onRemove={handleRemoveIngredient}
                  />
                ))}
              </div>
              
              <div className="add-ingredient-section">
                <div className="ingredient-input-container">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={handleIngredientInputChange}
                    onKeyPress={handleNewIngredientKeyPress}
                    onFocus={handleIngredientInputFocus}
                    onBlur={handleIngredientInputBlur}
                    className="new-ingredient-input"
                    placeholder="Add new ingredient..."
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <span className="suggestion-emoji">{getIngredientEmoji(suggestion)}</span>
                          <span className="suggestion-text">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  className="add-btn"
                  onClick={handleAddIngredient}
                  disabled={!newIngredient.trim()}
                >
                  ➕ Add
                </button>
              </div>
              
              <div className="edit-buttons">
                <button 
                  className="save-btn"
                  onClick={handleSaveIngredients}
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Updating Recipe...' : '💾 Save & Update Recipe'}
                </button>
              </div>
            </div>
          ) : (
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <IngredientItem
                  key={index}
                  ingredient={ingredient}
                  index={index}
                  getIngredientEmoji={getIngredientEmoji}
                  isEditing={false}
                />
              ))}
            </ul>
          )}
        </div>
        
        <div className="instructions">
          <h3>Instructions</h3>
          <ol>
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default RecipeSection;
