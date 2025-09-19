import React from 'react';

const UploadSection = ({ 
  image, 
  cookingTime, 
  cuisineKeywords, 
  generateRecipe, 
  isLoading,
  handleImageUpload,
  handleCookingTimeChange,
  handleCuisineKeywordsChange
}) => {
  return (
    <section className="upload-section">
      <div className="upload-area" onClick={() => document.getElementById('image-upload').click()}>
        {image ? (
          <img src={image} alt="Upload preview" className="preview-image" />
        ) : (
          <div className="upload-prompt">
            <span className="upload-icon">📷</span>
            <p>Click to upload a photo of your ingredients</p>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
      
      {image && (
        <div className="recipe-inputs">
          <div className="input-group">
            <label htmlFor="cooking-time">⏱️ Cooking Time (minutes) <span className="optional-text">(optional)</span></label>
            <input
              id="cooking-time"
              type="text"
              value={cookingTime}
              onChange={handleCookingTimeChange}
              placeholder="e.g., 30 (defaults to 20)"
              className="recipe-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="cuisine-keywords">🍽️ Cuisine Style <span className="optional-text">(optional)</span></label>
            <input
              id="cuisine-keywords"
              type="text"
              value={cuisineKeywords}
              onChange={handleCuisineKeywordsChange}
              placeholder="e.g., Italian, Asian, Mexican (defaults to Italian)"
              className="recipe-input"
            />
          </div>
        </div>
      )}
      
      <button 
        className="generate-btn" 
        onClick={generateRecipe}
        disabled={!image || isLoading}
      >
        {isLoading ? 'Cooking up a recipe...' : 'Generate Recipe'}
      </button>
    </section>
  );
};

export default UploadSection;
