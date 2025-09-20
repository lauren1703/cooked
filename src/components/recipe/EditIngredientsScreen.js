import React, { useState } from 'react';
import { useRecipe } from '../../context/RecipeContext';
import IngredientItem from '../utils/IngredientItem';
import './RecipeFlow.css';

const EditIngredientsScreen = () => {
  const { 
    editedIngredients, 
    newIngredient, 
    showSuggestions,
    filteredSuggestions,
    isLoading,
    getIngredientEmoji,
    handleRemoveIngredientFromList,
    handleAddIngredientToList,
    handleIngredientInputChange,
    handleIngredientInputFocus,
    handleIngredientInputBlur,
    handleSuggestionClick,
    handleIngredientsComplete,
    images,
    ingredientSources,
    processingStatus
  } = useRecipe();
  
  // State for showing image tooltip
  const [hoveredIngredient, setHoveredIngredient] = useState(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddIngredientToList();
    }
  };

  return (
    <section className="edit-ingredients-screen">
      <div className="ingredients-container">
        <h2 className="ingredients-title">We Found These Ingredients</h2>
        <p className="ingredients-subtitle">Add or remove ingredients to customize your recipe</p>
        
        {processingStatus.inProgress && (
          <div className="processing-status">
            <div className="processing-spinner"></div>
            <p>Processing images: {processingStatus.processed} of {processingStatus.total}</p>
          </div>
        )}
        
        <div className="ingredients-list">
          {editedIngredients.length === 0 ? (
            <div className="no-ingredients">
              <p>No ingredients detected. Add some ingredients to continue.</p>
            </div>
          ) : (
            editedIngredients.map((ingredient, index) => (
              <div 
                key={index} 
                className="ingredient-item-container"
                onMouseEnter={() => setHoveredIngredient(ingredient)}
                onMouseLeave={() => setHoveredIngredient(null)}
              >
                <IngredientItem
                  ingredient={ingredient}
                  index={index}
                  getIngredientEmoji={getIngredientEmoji}
                  isEditing={true}
                  onRemove={handleRemoveIngredientFromList}
                />
                
                {/* Source indicator */}
                {ingredientSources && ingredientSources[ingredient] !== undefined && (
                  <div className="source-indicator" title={`From image ${ingredientSources[ingredient] + 1}`}>
                    {ingredientSources[ingredient] + 1}
                  </div>
                )}
                
                {/* Image tooltip */}
                {hoveredIngredient === ingredient && images[ingredientSources[ingredient]] && (
                  <div className="image-tooltip">
                    <div className="tooltip-image-container">
                      <img 
                        src={images[ingredientSources[ingredient]]} 
                        alt={`Source of ${ingredient}`} 
                        className="tooltip-image"
                      />
                    </div>
                    <div className="tooltip-text">From image {ingredientSources[ingredient] + 1}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="add-ingredient-section">
          <div className="ingredient-input-container">
            <input
              type="text"
              value={newIngredient}
              onChange={handleIngredientInputChange}
              onKeyPress={handleKeyPress}
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
            onClick={handleAddIngredientToList}
            disabled={!newIngredient.trim()}
          >
            ➕ Add
          </button>
        </div>
        
        <div className="navigation-buttons">
          <button 
            className="continue-button"
            onClick={handleIngredientsComplete}
            disabled={editedIngredients.length === 0 || isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Preferences'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default EditIngredientsScreen;
