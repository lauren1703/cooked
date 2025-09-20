import React, { useState } from 'react';
import { useRecipe } from '../../context/RecipeContext';
import WebcamCapture from './WebcamCapture';
import './RecipeFlow.css';

const UploadImageScreen = () => {
  const { 
    images, 
    image, 
    currentImageIndex, 
    setCurrentImageIndex, 
    isLoading, 
    handleImageUpload,
    setImages,
    setDetectedIngredients,
    setEditedIngredients,
    setIngredientSources,
    setIsLoading,
    setCurrentStep,
    STEPS
  } = useRecipe();
  
  const [showWebcam, setShowWebcam] = useState(false);
  const [inputMethod, setInputMethod] = useState('upload'); // 'upload' or 'webcam'

  // Handle webcam captured images
  const handleWebcamCapture = (capturedImages) => {
    setImages(capturedImages);
    setCurrentImageIndex(0);
    setShowWebcam(false);
    setIsLoading(true);
    
    // Process all images to detect ingredients, similar to handleImageUpload in RecipeContext
    if (capturedImages.length > 0) {
      // Arrays to collect ingredients from all images
      const allIngredients = [];
      const sourceMap = {};
      let processedCount = 0;
      
      // Process each image
      capturedImages.forEach((imageData, fileIndex) => {
        console.log(`Processing webcam image ${fileIndex + 1} of ${capturedImages.length}...`);
        
        // Call the API to identify ingredients from each image
        fetch('http://localhost:5000/api/identify-ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: imageData
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(`Webcam image ${fileIndex + 1} processed:`, data);
          
          // Get the identified ingredients from the API response
          const identifiedIngredients = data.ingredients || [];
          
          // Add these ingredients to our collection and track their source
          identifiedIngredients.forEach(ingredient => {
            if (!allIngredients.includes(ingredient)) {
              allIngredients.push(ingredient);
              sourceMap[ingredient] = fileIndex;
            }
          });
          
          // Update processed count
          processedCount++;
          
          // When all images are processed
          if (processedCount === capturedImages.length) {
            // Update ingredients with all detected ingredients
            if (allIngredients.length > 0) {
              // Use whatever ingredients we did manage to detect
              setDetectedIngredients(allIngredients);
              setEditedIngredients(allIngredients);
              setIngredientSources(sourceMap);
            } else {
              // If no ingredients were detected, set empty arrays
              setDetectedIngredients([]);
              setEditedIngredients([]);
              setIngredientSources({});
            }
            
            // Complete processing
            setIsLoading(false);
            
            // Move to the next step
            setCurrentStep(STEPS.EDIT_INGREDIENTS);
          }
        })
        .catch(error => {
          console.error(`Error processing webcam image ${fileIndex + 1}:`, error);
          
          // Still count this as processed even if it failed
          processedCount++;
          
          // When all images are processed (even with some failures)
          if (processedCount === capturedImages.length) {
            // If we have ingredients from other images, use those
            if (allIngredients.length > 0) {
              setDetectedIngredients(allIngredients);
              setEditedIngredients(allIngredients);
              setIngredientSources(sourceMap);
            } else {
              // If no ingredients at all, set empty arrays
              setDetectedIngredients([]);
              setEditedIngredients([]);
              setIngredientSources({});
            }
            
            // Complete processing
            setIsLoading(false);
            setCurrentStep(STEPS.EDIT_INGREDIENTS);
          }
        });
      });
    }
  };
  
  const toggleInputMethod = (method) => {
    setInputMethod(method);
    if (method === 'webcam') {
      setShowWebcam(true);
    }
  };
  
  const handleCloseWebcam = () => {
    setShowWebcam(false);
    setInputMethod('upload');
  };

  return (
    <section className="upload-screen">
      <div className="upload-container">
        <h2 className="upload-title">Let's Cook Something Delicious!</h2>
        <p className="upload-subtitle">Take a photo or upload images of your ingredients to get started</p>
        
        {/* Input method selector */}
        <div className="input-method-selector">
          <button 
            className={`method-button ${inputMethod === 'upload' ? 'active' : ''}`}
            onClick={() => toggleInputMethod('upload')}
          >
            📁 Upload Photos
          </button>
          <button 
            className={`method-button ${inputMethod === 'webcam' ? 'active' : ''}`}
            onClick={() => toggleInputMethod('webcam')}
          >
            📷 Use Camera
          </button>
        </div>
        
        {showWebcam ? (
          <WebcamCapture onCapture={handleWebcamCapture} onClose={handleCloseWebcam} />
        ) : (
          <>
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
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            {images.length > 0 && !isLoading && (
              <div className="image-controls">
                <button 
                  className="retry-button"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  Upload more photos
                </button>
                
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
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default UploadImageScreen;
