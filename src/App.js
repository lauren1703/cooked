import { useState, useCallback } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const generateRecipe = useCallback(() => {
    if (!image) return;
    
    setIsLoading(true);
    // TODO: Implement actual API call to your AI service
    setTimeout(() => {
      setRecipe({
        name: 'Delicious Pasta Primavera',
        ingredients: [
          '200g pasta',
          '1 cup mixed vegetables (bell peppers, zucchini, carrots)',
          '2 cloves garlic, minced',
          '2 tbsp olive oil',
          'Salt and pepper to taste',
          'Grated parmesan for serving'
        ],
        instructions: [
          'Cook pasta according to package instructions.',
          'In a large pan, heat olive oil over medium heat.',
          'Add minced garlic and sauté until fragrant.',
          'Add mixed vegetables and cook until tender.',
          'Drain pasta and add to the pan with vegetables.',
          'Toss everything together and season with salt and pepper.',
          'Serve hot with grated parmesan.'
        ],
        cookingTime: '20 minutes',
        difficulty: 'Easy'
      });
      setIsLoading(false);
    }, 1500);
  }, [image]);

  return (
    <div className="app">
      <header className="header">
        <h1>Cooked</h1>
        <p>AI-Powered Recipe Generator</p>
      </header>

      <main className="main-content">
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
          
          <button 
            className="generate-btn" 
            onClick={generateRecipe}
            disabled={!image || isLoading}
          >
            {isLoading ? 'Cooking up a recipe...' : 'Generate Recipe'}
          </button>
        </section>

        {recipe && (
          <section className="recipe-section">
            <h2>{recipe.name}</h2>
            <div className="recipe-meta">
              <span>⏱️ {recipe.cookingTime}</span>
              <span>⚡ {recipe.difficulty}</span>
            </div>
            
            <div className="recipe-details">
              <div className="ingredients">
                <h3>Ingredients</h3>
                <ul>
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
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
        )}
      </main>

      <footer className="footer">
        <p>© 2023 Cooked - AI Recipe Generator</p>
      </footer>
    </div>
  );
}

export default App;
