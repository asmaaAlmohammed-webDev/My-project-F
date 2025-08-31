import React from 'react';
import './ReviewStars.css';

const ReviewStars = ({ 
  rating, 
  maxStars = 5, 
  size = 'medium', 
  interactive = false, 
  onRatingChange = null,
  showNumber = false 
}) => {
  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`review-stars ${size} ${interactive ? 'interactive' : ''}`}>
      <div className="stars-container">
        {[...Array(maxStars)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isHalfFilled = !isFilled && starRating - 0.5 <= rating;
          
          return (
            <span
              key={index}
              className={`star ${isFilled ? 'filled' : isHalfFilled ? 'half' : 'empty'}`}
              onClick={() => handleStarClick(starRating)}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleStarClick(starRating);
                }
              }}
            >
              {isFilled ? '★' : isHalfFilled ? '☆' : '☆'}
            </span>
          );
        })}
      </div>
      {showNumber && (
        <span className="rating-number">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default ReviewStars;
