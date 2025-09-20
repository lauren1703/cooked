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
    setImages
  } = useRecipe();
  
  const [showWebcam, setShowWebcam] = useState(false);
  const [inputMethod, setInputMethod] = useState('upload'); // 'upload' or 'webcam'

  // Handle webcam captured images
  const handleWebcamCapture = (capturedImages) => {
    setImages(capturedImages);
    setCurrentImageIndex(0);
    setShowWebcam(false);
    
    // Process the first image to detect ingredients
    // This simulates the same flow as handleImageUpload
    if (capturedImages.length > 0) {
      const firstImage = capturedImages[0];
      
      // Call the API to identify ingredients from the first image
      fetch('http://localhost:5000/api/identify-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: firstImage
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // The rest of the processing will be handled by the RecipeContext
        console.log('Webcam image processed:', data);
      })
      .catch(error => {
        console.error('Error processing webcam image:', error);
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
