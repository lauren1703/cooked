import React from 'react';

const StarRating = ({ rating, recipeId, onRatingChange }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star ${star <= (rating || 0) ? 'filled' : ''}`}
          onClick={() => onRatingChange(recipeId, star)}
          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
};

export default StarRating;
