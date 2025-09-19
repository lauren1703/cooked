import React from 'react';
import { useRecipe } from '../../context/RecipeContext';
import './RecipeFlow.css';

const UploadImageScreen = () => {
  const { image, isLoading, handleImageUpload } = useRecipe();

  return (
    <section className="upload-screen">
      <div className="upload-container">
        <h2 className="upload-title">Let's Cook Something Delicious!</h2>
        <p className="upload-subtitle">Upload a photo of your ingredients to get started</p>
        
        <div 
          className="upload-area" 
          onClick={() => document.getElementById('image-upload').click()}
        >
          {image ? (
            <div className="image-preview-container">
              <img src={image} alt="Upload preview" className="preview-image" />
              {isLoading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Identifying ingredients...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📷</div>
              <p>Click to upload a photo of your ingredients</p>
              <span className="upload-hint">We'll identify what you have and suggest recipes</span>
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
        
        {image && !isLoading && (
          <button 
            className="retry-button"
            onClick={() => document.getElementById('image-upload').click()}
          >
            Try a different photo
          </button>
        )}
      </div>
    </section>
  );
};

export default UploadImageScreen;
