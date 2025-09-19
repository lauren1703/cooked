import React from 'react';
import { useRecipe } from '../../context/RecipeContext';
import '../recipe/RecipeFlow.css';

const StepNavigation = () => {
  const { currentStep, STEPS, setCurrentStep } = useRecipe();
  
  const steps = [
    { id: STEPS.UPLOAD_IMAGE, label: 'Upload', icon: '📷' },
    { id: STEPS.EDIT_INGREDIENTS, label: 'Ingredients', icon: '🥕' },
    { id: STEPS.SET_PREFERENCES, label: 'Preferences', icon: '⚙️' },
    { id: STEPS.VIEW_RECIPES, label: 'Recipes', icon: '🍽️' },
    { id: STEPS.DONE, label: 'Done', icon: '✅' }
  ];
  
  // Find the current step index
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  // Determine which steps can be navigated to
  const canNavigateTo = (stepId) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    // Can't navigate to future steps that haven't been reached yet
    if (stepIndex > currentIndex) return false;
    
    // Can navigate to any previous step
    return true;
  };
  
  const handleStepClick = (stepId) => {
    if (canNavigateTo(stepId)) {
      setCurrentStep(stepId);
    }
  };
  
  // Don't show navigation for bookmarks or recipe view screens
  if (currentStep === STEPS.BOOKMARKS || currentStep === STEPS.RECIPE_VIEW) {
    return null;
  }
  
  return (
    <div className="step-navigation">
      <div className="steps-container">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div 
              className={`step ${currentStep === step.id ? 'active' : ''} ${canNavigateTo(step.id) ? 'clickable' : 'disabled'}`}
              onClick={() => handleStepClick(step.id)}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${index < currentIndex ? 'completed' : ''}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepNavigation;
