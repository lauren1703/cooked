import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import './RecipeFlow.css';

const WebcamCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "environment" // Use environment camera if available (back camera on mobile)
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const newCapturedImages = [...capturedImages, imageSrc];
        setCapturedImages(newCapturedImages);
      }
    }
  }, [capturedImages]);

  const handleSubmit = () => {
    if (capturedImages.length > 0) {
      onCapture(capturedImages);
    }
  };

  const handleRetake = () => {
    setCapturedImages([]);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="webcam-container">
      <div className="webcam-header">
        <h3>Capture Ingredients with Camera</h3>
        <button className="close-button" onClick={handleCancel}>×</button>
      </div>

      <div className="webcam-content">
        {capturedImages.length > 0 ? (
          <div className="captured-images">
            <div className="image-grid">
              {capturedImages.map((imgSrc, index) => (
                <div key={index} className="captured-image-container">
                  <img 
                    src={imgSrc} 
                    alt={`Captured ${index + 1}`} 
                    className="captured-image" 
                  />
                  <span className="image-number">{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="capture-actions">
              <button className="webcam-button" onClick={handleRetake}>
                Retake Photos
              </button>
              <button 
                className="webcam-button primary" 
                onClick={handleSubmit}
                disabled={capturedImages.length === 0}
              >
                Use {capturedImages.length} {capturedImages.length === 1 ? 'Photo' : 'Photos'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="webcam-view">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                className="webcam-video"
              />
              {!isCameraReady && (
                <div className="camera-loading">
                  <div className="spinner"></div>
                  <p>Accessing camera...</p>
                </div>
              )}
            </div>
            <div className="webcam-controls">
              <button 
                className="capture-button" 
                onClick={captureImage}
                disabled={!isCameraReady}
              >
                📸 Capture Ingredient
              </button>
              <p className="webcam-hint">
                Take multiple photos to capture all your ingredients
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
