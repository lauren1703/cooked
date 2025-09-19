import React from 'react';

const IngredientItem = ({ ingredient, index, getIngredientEmoji, isEditing, onRemove }) => {
  return (
    isEditing ? (
      <div className="ingredient-item">
        <span className="ingredient-emoji">{getIngredientEmoji(ingredient)}</span>
        <span className="ingredient-text">{ingredient}</span>
        {onRemove && (
          <button 
            className="remove-btn"
            onClick={() => onRemove(index)}
            title="Remove ingredient"
          >
            ❌
          </button>
        )}
      </div>
    ) : (
      <li>
        <span className="ingredient-emoji">{getIngredientEmoji(ingredient)}</span>
        {ingredient}
      </li>
    )
  );
};

export default IngredientItem;
